import { errorNoAuth, errorBadRequest, errorNotFound } from "@/lib/error";
import { AppRequest, AppResponse, UserRegisterData } from "@/lib/types";
import { SessionStore } from "@/lib/sessions";
import { Memory } from "@/memory";
import { generateID } from "@/lib/index.js";
import { Room } from "@/lib/room";
import { User } from "@/lib/user";
import Log from "@/lib/logger";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const id = req.session.id;
		const session = sessionStore.get(id);
		if (!session) return errorNoAuth(res);

		if (!req.body.data) return errorBadRequest(res);
		const { name, profilePicture, roomcode } = req.body.data as UserRegisterData

		const user = memory.user(id);
		if (user) {
			user.name = name;
			user.profilePicture = profilePicture;
			Log.api(`user[${memory.usize}] update`, id)
			return res.json(user.getData());
		}

		const newUser = new User(id, name)
		newUser.profilePicture = profilePicture;

		if (roomcode) {
			const room = memory.room(roomcode);
			if (!room) return errorNotFound(res);

			room.addUser(newUser);
			session.roomcode = roomcode;
		} else {
			let newroomcode: string;
			while (true) {
				newroomcode = generateID(10);
				if (!memory.room(newroomcode)) break;
			}

			const newRoom = new Room(newroomcode);
			newRoom.addUser(newUser);
			memory.addRoom(newRoom);
			session.roomcode = newroomcode;
			Log.api(`room[${memory.rsize}] add`, newroomcode)
			Log.api(`room ${newroomcode} ${Object.fromEntries(newRoom.getUsers())}`, id)
		}

		memory.addUser(newUser);
		Log.api(`user[${memory.usize}] add`, id)
		res.json(newUser.getData())
	}

export default handlerBuilder