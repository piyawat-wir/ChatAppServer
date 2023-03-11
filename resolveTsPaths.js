import p from 'path'

export async function resolve(s, parentModuleURL, defaultResolve) {
	let specifier = s;

	if (specifier.indexOf('@/') === 0) {
		let path = `./src/${specifier.slice(2)}`;
		specifier = 'file:///' + p.join(process.cwd(), path);
	}

	return defaultResolve(specifier, parentModuleURL, defaultResolve);
}