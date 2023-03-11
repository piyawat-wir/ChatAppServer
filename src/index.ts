import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server as SocketServer } from 'socket.io'
import { AppServerSocket, ErrorCode, SessionCookieData } from '@/lib/types'
import { SessionStore } from '@/lib/sessions'
import { expressMiddleware, socketMiddleware } from '@/middleware'
import { Memory } from '@/memory'
import { cleanRemoveUser } from '@/lib/index.js'
import { Log } from '@/lib/logger'

import sessionHandler from '@/handler/express/session'
import sessionCreateHandler from '@/handler/express/session/create'
import sessionDeleteHandler from '@/handler/express/session/delete'

import userHandler from '@/handler/express/user'
import userCreateHandler from '@/handler/express/user/create'
import userDeleteHandler from '@/handler/express/user/delete'

import roomHandler from '@/handler/express/room'
import roomJoinHandler from '@/handler/express/room/join'
import roomUpdateHandler from '@/handler/express/room/update'

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

app.post('/session', sessionHandler(sessionStore, memory))
app.post('/session/create', sessionCreateHandler(sessionStore, memory))
app.post('/session/delete', sessionDeleteHandler(sessionStore, memory))

app.post('/user', userHandler(sessionStore, memory))
app.post('/user/create', userCreateHandler(sessionStore, memory))
app.post('/user/delete', userDeleteHandler(sessionStore, memory))

app.post('/room', roomHandler(sessionStore, memory))
app.post('/room/:roomcode', roomJoinHandler(sessionStore, memory))
app.post('/room/update', roomUpdateHandler(sessionStore, memory))

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
		cleanRemoveUser(id, sessionStore, memory);
	});
	Log.server(sessionStore.data);
})