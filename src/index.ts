import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Server as SocketServer } from 'socket.io'
import { AppServerSocket, ErrorCode, SessionCookieData } from './lib/types'
import { Log } from './lib/logger'
import { ExtendedError } from 'socket.io/dist/namespace'
import { SessionData, SessionStore } from './lib/sessions'

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

app.use(cors(corsConfig));
app.use(express.json());

app.post('/user', (req, res) => { })

type SocketNext = ((err?: ExtendedError | undefined) => void)
const socketMiddleware = (socket: AppServerSocket, next: SocketNext) => {
	const { token } = socket.handshake.auth;
	const error = ErrorCode.InvalidCredential;

	try {
		if (!token) throw error;

		const session = jwt.verify(token, JWT_TOKEN_KEY) as SessionCookieData;

		if (!session) throw error;

		socket.request.session = session;
	} catch (err) {
		Log.socket.warn(`nope! ${socket.id}`);
		return next(error)
	}

	next();
}

io.use(socketMiddleware)

const sessionStore = new SessionStore();

io.on('connection', (socket: AppServerSocket) => {

	const session = socket.request.session as SessionCookieData;

	if (socket.recovered) {
		Log.socket(`userid ${session.id}//${socket.id} is reconnected`);
	}

	const data = sessionStore.get(session.id);
	
	if (data) {
		const otherSocket = data.getSocket();
		otherSocket.disconnect();
		Log.socket(`disconnected: ${session.id}//${otherSocket.id}`)
		data.setSocket(socket);
	} else {
		sessionStore.add(new SessionData(socket, session));
	}
	
	Log.socket(`userid ${session.id}//${socket.id} is connected`);

	socket.on('hello', data => {
		Log.socket(`${session.id}//${socket.id}: hello!`);
		socket.emit('replyhello');
	})

})

server.listen(PORT, () => {
	console.clear()
	Log.server(`Started running at localhost:${PORT}`);
	sessionStore.startPruneService();
})