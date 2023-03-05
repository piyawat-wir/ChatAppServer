import { Socket } from "socket.io";
import Log from "./logger";
import { datetime, SessionCookieData } from "./types";

export class SessionData implements SessionCookieData {
	public createTime: datetime = Date.now();
	public id: string;
	public roomcode: string;
	public sessionLifetime = 1000 * 60 * 60; //1 hr

	private socket: Socket;

	constructor(socket: Socket, data: SessionCookieData) {
		this.socket = socket;
		this.id = data.id;
		this.roomcode = data.roomcode;
	}
	public renew() { this.createTime = Date.now() }
	public get online() { return this.socket.connected }
	public get expire() { return Date.now() - this.createTime < this.sessionLifetime }
	public get socketid() { return this.socket.id }
	public getSocket() { return this.socket }
	public setSocket(socket: Socket) { this.socket = socket }
}

type userid = SessionCookieData['id']

export class SessionStore {
	private sessions = new Map<userid, SessionData>()
	private options = {
		pruneInterval: 1000 * 60 * 60 //1 hr
	}
	private lastPrune: datetime = 0;
	private runPruneService = false;

	public add(data: SessionData) { this.sessions.set(data.id, data) }
	public delete(id: userid) { this.sessions.delete(id) }
	public get(id: userid) {
		const session = this.sessions.get(id);
		if (!session) return;

		const { online } = session;
		const now = Date.now();

		if (online) return session;

		if (session.expire) {
			this.delete(session.id);
			return;
		}
	}
	public prune() {
		this.sessions.forEach((session, id) => {
			if (session.expire) this.delete(id);
		});
	}

	public async startPruneService() {
		this.runPruneService = true;
		const { pruneInterval } = this.options
		while (this.runPruneService) {
			const now = Date.now();
			if (now - this.lastPrune > pruneInterval) {
				this.prune();
				this.lastPrune = now;
				Log.server(`pruned SessionStore @ ${new Date(now).toLocaleString()}`)
			}

			await new Promise(resolve => setTimeout(resolve, this.options.pruneInterval));
		}
	}
	public stopPruneService() { this.runPruneService = false }

}