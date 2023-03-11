import { errorNoAuth } from "@/lib/error";
import { SessionStore } from "@/lib/sessions";
import { AppRequest, AppResponse } from "@/lib/types";
import { Memory } from "@/memory";
import Log from "@/lib/logger";
import { cleanRemoveUser } from "@/lib/index.js";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);
		const id = req.session.id;

		cleanRemoveUser(id, sessionStore, memory);
		sessionStore.delete(id);
		Log.api(`user[${memory.usize}] delete`, id);
		Log.api(`session[${sessionStore.data.size}] delete`, id);
		res.sendStatus(200);
	}

export default handlerBuilder
