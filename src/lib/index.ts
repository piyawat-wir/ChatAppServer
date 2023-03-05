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