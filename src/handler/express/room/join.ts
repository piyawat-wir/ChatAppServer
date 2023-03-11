import { errorNoAuth } from "@/lib/error";
import { SessionStore } from "@/lib/sessions";
import { AppRequest, AppResponse } from "@/lib/types";
import { Memory } from "@/memory";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const roomcode = req.params.roomcode;

		// TODO: room exists -> join room & return ok
		// TODO: else -> return not found

		res.send('join room ' + roomcode);
	}

export default handlerBuilder