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

	public addUser(user: User) { this.users.set(user.id, user) }
	public removeUser(user: User) { this.users.delete(user.id) }

	public sendMessage(user: User, message: string) {
		this.messages.push(new TextMessage(user, message))
	}

	public getRecentChat(N: number = 100) { return this.messages.slice(-N) }
}