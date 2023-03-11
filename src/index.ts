import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server as SocketServer, Socket } from 'socket.io'
import { AppServerSocket, ErrorCode, SessionCookieData, UserRegisterData } from './lib/types'
import { SessionData, SessionStore } from './lib/sessions'
import { Room, RoomData } from './lib/room'
import { User } from './lib/user'
import { Log } from './lib/logger'
import { generateID } from './lib'
import { AppRequest, expressMiddleware, socketMiddleware } from './middleware'
import { Memory } from './memory'
import { errorNoAuth, errorNotFound, errorBadRequest } from './lib/error'

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_TOKEN_KEY = process.env.JWT_TOKEN_KEY || 'defaultsecretkey';

const corsConfig = {
	origin: process.env.FRONTEND_URI,
	methods: ['GET', 'POST']
}

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
	cors: corsConfig,
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000, //2 mins?
		skipMiddlewares: false
	}
});

const sessionStore = new SessionStore();
const memory = new Memory();

app.use(cors(corsConfig));
app.use(express.json());
app.use(expressMiddleware(JWT_TOKEN_KEY));
io.use(socketMiddleware(JWT_TOKEN_KEY));

const cleanRemoveUser = (id: string) => {
	const session = sessionStore.get(id);
	if (!session) return;
	const room = memory.room(session.roomcode);
	const user = memory.user(id);
	if (room && user) room.removeUser(user);

	session.roomcode = '';
	memory.removeUser(id);
}

app.post('/session', async (req: AppRequest, res) => {
	if (!req.session) return errorNoAuth(res);

	const data = sessionStore.get(req.session.id);
	if (!data) return errorNotFound(res);

	data.renew();
	res.json(data.getData());
})
app.post('/session/create', async (req, res) => {
	let id: string;
	while (true) {
		id = generateID(10);
		if (!sessionStore.has(id)) break;
	}
	const session = new SessionData(id);
	sessionStore.add(session);
	Log.api(`session[${sessionStore.data.size}] add`, session.id);
	res.json(session)
})
app.post('/session/delete', async (req: AppRequest, res) => {
	if (!req.session) return errorNoAuth(res);
	const id = req.session.id;

	cleanRemoveUser(id);
	sessionStore.delete(id);
	Log.api(`user[${memory.usize}] delete`, id);
	Log.api(`session[${sessionStore.data.size}] delete`, id);
	res.sendStatus(200);
})

app.post('/user', async (req: AppRequest, res) => { // get user data
	if (!req.session) return errorNoAuth(res);

	const user = memory.user(req.session.id);
	if (!user) return errorNotFound(res);

	res.json(user.getData());
})
app.post('/user/create', async (req: AppRequest, res) => { // create/update user
	if (!req.session) return errorNoAuth(res);

	const id = req.session.id;
	const session = sessionStore.get(id);
	if (!session) return errorNoAuth(res);

	if (!req.body.data) return errorBadRequest(res);
	const { name, profilePicture, roomcode } = req.body.data as UserRegisterData

	const user = memory.user(id);
	if (user) {
		user.name = name;
		user.profilePicture = profilePicture;
		Log.api(`user[${memory.usize}] update`, id)
		return res.json(user.getData());
	}

	const newUser = new User(id, name)
	newUser.profilePicture = profilePicture;

	if (roomcode) {
		const room = memory.room(roomcode);
		if (!room) return errorNotFound(res);

		room.addUser(newUser);
		session.roomcode = roomcode;
	} else {
		let newroomcode: string;
		while (true) {
			newroomcode = generateID(10);
			if (!memory.room(newroomcode)) break;
		}

		const newRoom = new Room(newroomcode);
		newRoom.addUser(newUser);
		memory.addRoom(newRoom);
		session.roomcode = newroomcode;
		Log.api(`room[${memory.rsize}] add`, newroomcode)
		Log.api(`room ${newroomcode} ${Object.fromEntries(newRoom.getUsers())}`, id)
	}

	memory.addUser(newUser);
	Log.api(`user[${memory.usize}] add`, id)
	res.json(newUser.getData())
})
app.post('/user/delete', async (req: AppRequest, res) => { // delete user
	if (!req.session) return errorNoAuth(res);

	const id = req.session.id;
	const session = sessionStore.get(id);

	if (!session) return errorNoAuth(res);

	cleanRemoveUser(id);
	Log.api(`user[${memory.usize}] delete`, id);
	res.sendStatus(200)
})

app.post('/room', async (req: AppRequest, res) => { // get room data
	if (!req.session) return errorNoAuth(res);

	const id = req.session.id;
	const session = sessionStore.get(id);

	if (!session) return errorNoAuth(res);

	const room = memory.room(session.roomcode);
	if (!room) return errorNotFound(res);

	res.json(room.getData());
})
app.post('/room/:roomcode', async (req: AppRequest, res) => { // join room
	if (!req.session) return errorNoAuth(res);

	const roomcode = req.params.roomcode;

	// TODO: room exists -> join room & return ok
	// TODO: else -> return not found

	res.send('join room ' + roomcode);
})
app.post('/room/update', async (req: AppRequest, res) => { // update room
	if (!req.session) return errorNoAuth(res);

	const id = req.session.id;
	const session = sessionStore.get(id);

	if (!session) return errorNoAuth(res);

	const room = memory.room(session.roomcode);
	if (!room) return errorNotFound(res);

	if (!req.body.data) return errorBadRequest(res);
	const { name, description } = req.body.data as RoomData;

	room.name = name;
	room.description = description;

	res.json(room.getData());
})

io.on('connection', (socket: AppServerSocket) => {

	const sessionCookie = socket.request.session as SessionCookieData;
	const { id } = sessionCookie;

	if (socket.recovered) {
		Log.socket(`userid ${id}//${socket.id} is reconnected`);
	}

	// Has session authenticated?
	const session = sessionStore.get(id);
	if (!session) {
		socket.emit('error', { message: ErrorCode.InvalidCredential.message });
		socket.disconnect();
		return;
	}

	// Multiple socket with same ID blocker
	const otherSocket = session.getSocket();
	if (otherSocket) {
		otherSocket.disconnect();
		Log.socket(`disconnected: ${id}//${otherSocket.id}`)
	}
	session.setSocket(socket);

	const { roomcode } = session;
	socket.join(roomcode)

	Log.socket(`userid ${id}//${socket.id} is connected`);

	const user = memory.user(id);
	if (!user) return socket.emit('error', { message: "Internal Server Error" });

	// Send message event
	socket.on('send_message', (data: string) => {
		const msg = user.sendMessage(data);
		if (!msg) return;
		io.in(roomcode).emit('other_sent', msg);
	});

	// Send current chat log in the room
	socket.emit('chat_log', user.getRoom()?.getRecentChat() || [])
})

server.listen(PORT, () => {
	console.clear()
	Log.server(`Started running at localhost:${PORT}`);
	sessionStore.startPruneService(id => {
		cleanRemoveUser(id);
	});
	Log.server(sessionStore.data);
})