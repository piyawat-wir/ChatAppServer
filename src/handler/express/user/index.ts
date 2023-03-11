import { errorNoAuth, errorNotFound } from "@/lib/error";
import { SessionStore } from "@/lib/sessions";
import { AppRequest, AppResponse } from "@/lib/types";
import { Memory } from "@/memory";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const user = memory.user(req.session.id);
		if (!user) return errorNotFound(res);

		res.json(user.getData());
	}

export default handlerBuilder