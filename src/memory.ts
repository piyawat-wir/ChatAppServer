import { Room } from "@/lib/room";
import { User } from "@/lib/user";

export class Memory {

	private users = new Map<string, User>();
	private rooms = new Map<string, Room>();

	public get usize() { return this.users.size } 
	public get rsize() { return this.rooms.size } 

	public room(roomcode: string) { return this.rooms.get(roomcode) }
	public user(id: string) { return this.users.get(id) }

	public addUser(user: User) { this.users.set(user.id, user) }
	public removeUser(id: string) { this.users.delete(id) }
	
	public addRoom(room: Room) { this.rooms.set(room.roomcode, room) }
	public removeRoom(roomcode: string) { this.rooms.delete(roomcode) }

}