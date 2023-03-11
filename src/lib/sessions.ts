import { Socket } from "socket.io";
import Log from "@/lib/logger";
import { datetime, SessionCookieData } from "@/lib/types";

export class SessionData implements SessionCookieData {
	public createTime: datetime = Date.now();
	public id: string;
	public roomcode: string = '';
	public sessionLifetime = 1000 * 60 * 60; //1 hr

	private socket?: Socket;

	constructor(id: string) {
		this.id = id
	}
	public renew() { this.createTime = Date.now() }
	public get online() { return this.socket?.connected || false }
	public get expire() { return (Date.now() - this.createTime) >= this.sessionLifetime }
	public get socketid() { return this.socket?.id }
	public getSocket() { return this.socket }
	public setSocket(socket: Socket) { this.socket = socket }
	public getData = () => ({
		createTime: this.createTime,
		id: this.id,
		roomcode: this.roomcode,
		sessionLifetime: this.sessionLifetime,
	})
}

type userid = SessionCookieData['id']

export class SessionStore {
	private sessions = new Map<userid, SessionData>()
	private options = {
		pruneInterval: 1000 * 60 * 60 //1 hr
	}
	private lastPrune: datetime = 0;
	private runPruneService = false;

	public get data() { return this.sessions }

	public add(data: SessionData) { return this.sessions.set(data.id, data) }
	public delete(id: userid) { return this.sessions.delete(id) }
	public has(id: userid) { return this.sessions.has(id) }
	public get(id: userid) {
		const session = this.sessions.get(id);

		if (!session) return;

		const { online, expire } = session;

		if (expire && !online) {
			this.delete(session.id);
			return;
		}

		return session;
	}
	public prune(beforeDelete?: (id: string) => any) {
		this.sessions.forEach((session, id) => {
			if (session.expire) {
				if (beforeDelete) beforeDelete(id);
				this.delete(id);
			}
		});
	}

	public async startPruneService(beforeDelete?: (id: string) => any) {
		this.runPruneService = true;
		const { pruneInterval } = this.options
		while (this.runPruneService) {
			const now = Date.now();
			if (now - this.lastPrune > pruneInterval) {
				this.prune(beforeDelete);
				this.lastPrune = now;
				Log.server(`pruned SessionStore @ ${new Date(now).toLocaleString()}`)
			}

			await new Promise(resolve => setTimeout(resolve, this.options.pruneInterval));
		}
	}
	public stopPruneService() { this.runPruneService = false }

}