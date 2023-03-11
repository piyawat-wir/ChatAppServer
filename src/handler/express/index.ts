
import sessionGetHandler from './session'
import sessionCreateHandler from './session/create'
import sessionDeleteHandler from './session/delete'

import userGetHandler from './user'
import userCreateHandler from './user/create'
import userDeleteHandler from './user/delete'

import roomGetHandler from './room'
import roomJoinHandler from './room/join'
import roomUpdateHandler from './room/update'

export const sessionHandler = {
	get: sessionGetHandler,
	create: sessionCreateHandler,
	delete: sessionDeleteHandler
}

export const userHandler = {
	get: userGetHandler,
	create: userCreateHandler,
	delete: userDeleteHandler
}

export const roomHandler = {
	get: roomGetHandler,
	join: roomJoinHandler,
	update: roomUpdateHandler
}