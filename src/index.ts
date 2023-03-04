import express from 'express'
import http, { IncomingMessage } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Server as SocketServer, Socket } from 'socket.io'
import { Handshake } from 'socket.io/dist/socket'
import { ErrorCode } from './lib/types'

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

interface AppServerSocket extends Socket {
	handshake: Handshake & {
		auth: {
			token?: string
		}
	},
	request: IncomingMessage & {
		session?: SessionData
	}
}

interface SessionData {
	id: string,
	roomcode: string
}

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

server.listen(PORT, () => {
	console.log(`Server is running at localhost:${PORT}`);
})