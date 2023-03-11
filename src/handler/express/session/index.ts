import { errorNoAuth, errorNotFound } from "@/lib/error";
import { AppRequest, AppResponse } from "@/lib/types";
import { SessionStore } from "@/lib/sessions";
import { Memory } from "@/memory";

const handlerBuilder = (sessionStore: SessionStore, memory: Memory) =>
	async (req: AppRequest, res: AppResponse) => {
		if (!req.session) return errorNoAuth(res);

		const data = sessionStore.get(req.session.id);
		if (!data) return errorNotFound(res);

		data.renew();
		res.json(data.getData());
	}

export default handlerBuilder