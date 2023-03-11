import { IncomingMessage } from "http"
import { Socket } from "socket.io"
import { ExtendedError } from "socket.io/dist/namespace"
import { Handshake } from "socket.io/dist/socket"
import { Request, Response } from 'express'

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
		session?: SessionCookieData,

	}
}

export interface AppRequest extends Request {
	body: {
		auth: string
		data?: Record<string, any>
	},
	session?: SessionCookieData
}

export interface AppResponse extends Response {}

export interface SessionCookieData {
	id: string
}

export type datetime = ReturnType<typeof Date.now>

export interface UserRegisterData {
	name: string;
	profilePicture: string;
	roomcode?: string,
}