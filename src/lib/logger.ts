
function LoggerFactory(name: string, c: number = 36) {
	const color = `\x1b[2;${c}m`
	const reset = `\x1b[0m`
	const warn = `\x1b[0;33m`
	const error = `\x1b[0;31m`
	const func = (...args: any[]) => { console.log(`${color}[${name}]${reset}`, ...args, reset) }
	func.log = (...args: any[]) => { console.log(`${color}[${name}]${reset}`, ...args, reset) }
	func.warn = (...args: any[]) => { console.log(`${color}[${name}]${warn}`, ...args, reset) }
	func.error = (...args: any[]) => { console.log(`${color}[${name}]${error}`, ...args, reset) }
	return func;
}

export const Log = {
	server: LoggerFactory('server'),
	socket: LoggerFactory('socket', 32),
	middle: LoggerFactory('middle', 33),
	api: LoggerFactory('api', 34),
}

export default Log;