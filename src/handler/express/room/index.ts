import { errorNoAuth, errorNotFound } from "@/lib/error";
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

		res.json(room.getData());
	}

export default handlerBuilder