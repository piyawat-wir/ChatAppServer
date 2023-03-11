import { errorNoAuth, errorNotFound, errorBadRequest } from "@/lib/error";
import { RoomData } from "@/lib/room";
import { SessionStore } from "@/lib/sessions";
import { AppRequest, AppResponse } from "@/lib/types";
import { Memory } from "@/memory";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const id = req.session.id;
		const session = sessionStore.get(id);

		if (!session) return errorNoAuth(res);

		const room = memory.room(session.roomcode);
		if (!room) return errorNotFound(res);

		if (!req.body.data) return errorBadRequest(res);
		const { name, description } = req.body.data as RoomData;

		room.name = name;
		room.description = description;

		res.json(room.getData());
	}

export default handlerBuilder