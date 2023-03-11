import { Socket } from "socket.io"
import { Room } from "@/lib/room"

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
	public set name(name: string) { this.data.name = name }

	public get profilePicture() { return this.data.profilePicture }
	public set profilePicture(v: string) { this.data.profilePicture = v }

	public getSocket() { return this.socket }
	public setSocket(socket: Socket) { this.socket = socket }
	public getData() { return this.data }
	public getRoom() { return this.room }

	public join(room: Room) {
		if (this.room) {
			if (this.room.roomcode !== room.roomcode) this.leave();
		}
		if (!room.hasUser(this)) room.addUser(this);
		this.room = room;
	}
	public leave() {
		if (!this.room) return;
		const oldRoom = this.room;
		this.room = null;
		if (oldRoom.hasUser(this))
			oldRoom.removeUser(this);
	}
	public sendMessage(message: string) {
		return this.room?.sendMessage(this, message);
	}
}