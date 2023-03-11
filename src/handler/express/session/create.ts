import { SessionData, SessionStore } from "@/lib/sessions";
import { AppRequest, AppResponse } from "@/lib/types";
import { generateID } from "@/lib/index.js";
import { Memory } from "@/memory";
import Log from "@/lib/logger";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		let id: string;
		while (true) {
			id = generateID(10);
			if (!sessionStore.has(id)) break;
		}
		const session = new SessionData(id);
		sessionStore.add(session);
		Log.api(`session[${sessionStore.data.size}] add`, session.id);
		res.json(session)
	}

export default handlerBuilder