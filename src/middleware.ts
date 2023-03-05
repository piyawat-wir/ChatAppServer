import { ExtendedError } from "socket.io/dist/namespace";
import { AppServerSocket, ErrorCode, SessionCookieData } from "./lib/types";
import Log from "./lib/logger";
import jwt from 'jsonwebtoken'
import { RequestHandler, Request } from 'express'

export interface AppRequest extends Request {
	body: {
		auth?: string
		data?: Record<string, any>
	},
	session?: SessionCookieData
}

interface ValidationParameter {
	token?: string
	jwt_key: string
	req: AppRequest
}
function validateSession({ token, jwt_key, req }: ValidationParameter) {
	const error = ErrorCode.InvalidCredential;

	if (!token) throw error;

	try {
		const session = jwt.verify(token, jwt_key) as SessionCookieData;
		if (!session) throw error;
		req.session = session;
	}
	catch (err) { throw error }
}

export function expressMiddleware(jwt_key: string): RequestHandler {
	return (req: AppRequest, res, next) => {
		const { auth: token } = req.body;

		try { validateSession({ token, jwt_key, req }) }
		catch (err) {
			Log.api.warn(`nope! ${req.socket.remoteAddress}`)
			res.send('No!')
			return;
		}

		next();
	}
}

type SocketNext = ((err?: ExtendedError | undefined) => void)
export function socketMiddleware(jwt_key: string) {
	return (socket: AppServerSocket, next: SocketNext) => {
		const { token } = socket.handshake.auth;

		try {
			validateSession({
				token, jwt_key,
				req: socket.request as AppRequest
			})
		} catch (err: any) {
			Log.socket.warn(`nope! ${socket.id}`)
			return next(err)
		}

		next();
	}
}