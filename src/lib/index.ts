import { Memory } from "@/memory";
import { SessionStore } from "@/lib/sessions";

export function generateID(length: number) {
	const numeral = "0123456789";
	const alphabetL = "abcdefghijklmnopqrstuvwxyz";
	const alphabetH = alphabetL.toUpperCase();
	const charSet = numeral + alphabetH + alphabetL;
	let id = '';

	for (let i = 0; i < length; i++) {
		let ci = Math.floor(Math.random()*charSet.length);
		id += charSet[ci]
	}
	return id;
}

export const cleanRemoveUser = (id: string, sessionStore: SessionStore, memory: Memory) => {
	const session = sessionStore.get(id);
	if (!session) return;
	const room = memory.room(session.roomcode);
	const user = memory.user(id);
	if (room && user) room.removeUser(user);

	session.roomcode = '';
	memory.removeUser(id);
}