import { Socket } from "socket.io"
import { generateID } from "."
import { Room } from "./room"

export interface UserData {
	id: string
	name: string
	profilePicture: string
}

export class User {
	private data: UserData = {
		id: '',
		name: 'Default name',
		profilePicture: '',
	}
	private room: Room | null = null;
	private socket: Socket | null = null;

	constructor(id: string, name: string) {
		this.data.id = id;
		this.name = name
	}

	public get id() { return this.data.id }

	public get name() { return this.data.name }
	public set name(name: string) { this.data.id = name }

	public get profilePicture() { return this.data.profilePicture }
	public set profilePicture(v: string) { this.data.profilePicture = v }

	public getSocket() { return this.socket }
	public setSocket(socket: Socket) { this.socket = socket }

	public join(room: Room) {
		room.addUser(this);
		this.room = room;
	}
	public leave() {
		this.room?.removeUser(this);
		this.room = null;
	}
	public sendMessage(message: string) {
		this.room?.sendMessage(this, message);
	}
}