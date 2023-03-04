import { ExtendedError } from "socket.io/dist/namespace"

enum ErrorMessage {
	InvalidCredential = "InvalidCredential"
}

export const ErrorCode = {
	InvalidCredential: new Error(ErrorMessage.InvalidCredential) as ExtendedError
}