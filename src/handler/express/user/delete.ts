import { AppRequest, AppResponse } from "@/lib/types";
import { errorNoAuth } from "@/lib/error";
import { SessionStore } from "@/lib/sessions";
import { Memory } from "@/memory";
import { cleanRemoveUser } from "@/lib/index.js";
import Log from "@/lib/logger";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const id = req.session.id;
		const session = sessionStore.get(id);

		if (!session) return errorNoAuth(res);

		cleanRemoveUser(id, sessionStore, memory);
		Log.api(`user[${memory.usize}] delete`, id);
		res.sendStatus(200)
	}

export default handlerBuilder