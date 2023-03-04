import express from 'express'
import http, { IncomingMessage } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Server as SocketServer, Socket } from 'socket.io'
import { AppServerSocket, ErrorCode, SessionData } from './lib/types'

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_TOKEN_KEY = process.env.JWT_TOKEN_KEY || 'defaultsecretkey';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new SocketServer(server, {
	cors: {
		origin: process.env.FRONTEND_URI,
		methods: ['GET', 'POST']
	}
});

io.use((socket: AppServerSocket, next) => {
	const { token } = socket.handshake.auth;
	const error = ErrorCode.InvalidCredential;

	try {
		if (!token) throw error;

		const session = jwt.verify(token, JWT_TOKEN_KEY) as SessionData;

		if (!session) throw error;

		socket.request.session = session;
	} catch (err) {
		console.log(`nope! ${socket.id}`);
		return next(error)
	}

	next();
})

interface SessionSocket {socket: AppServerSocket, roomcode: string}
const SessionSocketRecord = new Map<string, SessionSocket>();

io.on('connection', (socket: AppServerSocket) => {
	const session = socket.request.session as SessionData;

	console.log(`userid ${session.id}//${socket.id} is connected`);

	if (SessionSocketRecord.has(session.id)) {
		const {socket: otherSocket} = SessionSocketRecord.get(session.id) as SessionSocket;
		otherSocket.disconnect();
		console.log(`disconnected: ${session.id}//${otherSocket.id}`)
	}
	SessionSocketRecord.set(session.id, {socket, roomcode: session.roomcode});

	socket.on('hello', data => {
		console.log(`${session.id}//${socket.id}: hello!`);
		socket.emit('replyhello');
	})

})

server.listen(PORT, () => {
	console.log(`Server is running at localhost:${PORT}`);
})