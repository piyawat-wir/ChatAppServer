import { ExtendedError } from "socket.io/dist/namespace";
import { AppServerSocket, ErrorCode, SessionCookieData } from "./lib/types";
import Log from "./lib/logger";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

type SocketNext = ((err?: ExtendedError | undefined) => void)
export const socketMiddleware = (jwt_key: string) =>
	(socket: AppServerSocket, next: SocketNext) => {
		const { token } = socket.handshake.auth;
		const error = ErrorCode.InvalidCredential;

		try {
			if (!token) throw error;

			const session = jwt.verify(token, jwt_key) as SessionCookieData;

			if (!session) throw error;

			socket.request.session = session;
		} catch (err) {
			Log.socket.warn(`nope! ${socket.id}`);
			return next(error)
		}

		next();
	}