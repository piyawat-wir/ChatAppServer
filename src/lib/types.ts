import { IncomingMessage } from "http"
import { Socket } from "socket.io"
import { ExtendedError } from "socket.io/dist/namespace"
import { Handshake } from "socket.io/dist/socket"

enum ErrorMessage {
	InvalidCredential = "InvalidCredential"
}

export const ErrorCode = {
	InvalidCredential: new Error(ErrorMessage.InvalidCredential) as ExtendedError
}

export interface AppServerSocket extends Socket {
	handshake: Handshake & {
		auth: {
			token?: string
		}
	},
	request: IncomingMessage & {
		session?: SessionData
	}
}

export interface SessionData {
	id: string,
	roomcode: string
}