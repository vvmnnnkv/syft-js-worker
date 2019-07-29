const COMPRESSION_LZ4 = 41
const COMPRESSION_ZSTD = 42
const COMPRESSION_NONE = 40

const OP_COMMAND = 1
const OP_OBJECT = 2
const OP_OBJECT_REQUEST = 3
const OP_OBJECT_DEL = 4
const OP_OBJECT_FORCE_DEL = 9

const COMMAND_ADD = '__add__'
const COMMAND_MUL = '__mul__'


function fromArray(arr) {
	let data = new Uint8Array(arr)

	switch (data[0]) {
		case COMPRESSION_NONE:
			data = data.subarray(1)
			break
		default:
			throw new SyftMessageParseError(`Unsupported compression ${data[0]}`)
			break
	}
	
	let rawData = MessagePack.decode(data)
	let unpacked = detail(null, rawData)
	let [op, opData] = unpacked
	let message = new SyftMessage

	switch (op) {
		case OP_OBJECT:
			message.command = "set"
			message.arguments.push(opData)
			break
		
		case OP_COMMAND:
			message.command = "cmd"
			message.arguments.push(opData)
			break

		case OP_OBJECT_FORCE_DEL:
			message.command = "unset"
			message.arguments.push(opData)
			break

		case OP_OBJECT_REQUEST:
			message.command = "send"
			message.arguments.push(opData)

		default:
			throw new SyftMessageParseError(`Unsupported operation type ${op}`)
	}
	
	console.log(message)
	return message
}



function parseTensor(data) {
	let tensor = new SyftTensor
	tensor.id = data[0]
	tensorbuff = Uint8Array.from(data[1])
	tensor.data = fromArrayBuffer(tensorbuff.buffer, tensorbuff.byteOffset)
	return tensor
}
