
function LoggerFactory(name: string, c: number = 36) {
	const color = `\x1b[0;${c}m`
	const reset = `\x1b[0m`
	return (...args: any[]) => { console.log(`${color}[${name}]${reset}`, ...args) }
}

export const Log = {
	server: LoggerFactory('server'),
	socket: LoggerFactory('socket', 32),
	middle: LoggerFactory('middle', 33),
	api: LoggerFactory('api', 34),
}

export default Log;