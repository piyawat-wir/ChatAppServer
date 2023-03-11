import { datetime } from "./types"
import { User, UserData } from "./user"

export enum MessageType {
	Text = 'text'
}

export abstract class Message {
	public id: number
	public userid: User['id']
	public username: string
	public profilePicture: string
	public abstract type: MessageType
	public data: any
	public time: datetime
	constructor(user: User, data: any) {
		const createTime = Date.now();
		this.id = createTime;
		this.userid = user.id;
		this.username = user.name;
		this.profilePicture = user.profilePicture;
		this.data = data;
		this.time = createTime;
	}
}

export class TextMessage extends Message {
	public type: MessageType.Text = MessageType.Text;
	public data: string;
	constructor(user: User, data: string) {
		super(user, data);
		this.data = data;
	}
}