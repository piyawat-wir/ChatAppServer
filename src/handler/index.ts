
import sessionGetHandler from '@/handler/express/session'
import sessionCreateHandler from '@/handler/express/session/create'
import sessionDeleteHandler from '@/handler/express/session/delete'

import userGetHandler from '@/handler/express/user'
import userCreateHandler from '@/handler/express/user/create'
import userDeleteHandler from '@/handler/express/user/delete'

import roomGetHandler from '@/handler/express/room'
import roomJoinHandler from '@/handler/express/room/join'
import roomUpdateHandler from '@/handler/express/room/update'

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