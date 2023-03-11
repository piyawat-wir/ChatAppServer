import { generateID } from "."
import { Message, TextMessage } from "./message"
import { User } from "./user"

export interface RoomData {
	roomcode: string
	name: string
	description: string
}

export class Room {
	private data: RoomData = {
		roomcode: '',
		name: "Default room name",
		description: "[ description here ]"
	}

	private users = new Map<string, User>()
	private messages: Message[] = [];

	constructor(roomcode: string) {
		this.data.roomcode = roomcode;
	}

	public get roomcode() { return this.data.roomcode }

	public get name() { return this.data.name }
	public set name(name: string) { this.data.name = name }

	public get description() { return this.data.description }
	public set description(desc: string) { this.data.description = desc }

	public addUser(user: User) {
		this.users.set(user.id, user);
		user.join(this);
	}
	public removeUser(user: User) {
		this.users.delete(user.id);
		user.leave();
	}
	public hasUser(user: User) { return this.users.get(user.id) }
	public getUsers() { return this.users }

	public sendMessage(user: User, message: string) {
		const msg = new TextMessage(user, message);
		this.messages.push(msg)
		return msg;
	}

	public getRecentChat(N: number = 100) { return this.messages.slice(-N) }
	public getData() { return this.data }
}