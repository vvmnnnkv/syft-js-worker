
class SyftConnector extends EventTarget {

	constructor() {
		super()
	}

	ack() {

	}

	onConnect(listener) {
		this.addEventListener('connect', listener)
	}

	onMessage(listener) {
		this.addEventListener('message', listener)
	}

	onDisconnect(listener) {
		this.addEventListener('disconnect', listener)
	}
}

class SyftConnectorSocketIO extends SyftConnector {

	constructor(url) {
		super();
		this.url = url
		this.socket = io(this.url)
		this.socket.on('connect', this.dispatchEvent(new CustomEvent('connect')))
		this.socket.on('message', this.dispatchEvent(new CustomEvent('message', {detail: data})))
		this.socket.on('disconnect', this.dispatchEvent(new CustomEvent('disconnect')))
	}

	ack() {
		this.socket.emit('client_ack', '1')
	}

	send(message) {
		this.socket.emit('send_response', message)
	}
}

class SyftBackend {
	tensors = {}

	addTensor(tensorId, tensor) {
		this.tensors[tensorId] = tensor
	}

	getTensor(tensorId) {
		return this.tensors[tensorId]
	}

	deleteTensor(tensorId) {
		delete this.tensors[tensorId]
	}
}

class SyftBackendTf extends SyftProcessor {
	addTensor(tensorId, tensor) {
		let t = tf.tensor(tensor.data, tensor.shape)
		super.addTensor(tensorId, t)
	}
}

class SyftProcessor {
	constructor() {

	}

	processMessage() {
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
	}
}

class SyftWorker extends EventTarget {

	tensors = {}

	/**
	 * @param connector
	 * @param processor
	 */
	constructor(connector, processor, backend) {
		super()
		this.connector = connector
		this.processor = processor
		this.backend = backend
		this.connector.onMessage((e) => this.processMessage(e.detail))
		this.connector.onConnect((e) => this.dispatchEvent(new CustomEvent('connect')))
	}

	onReady(listener) {
		this.addEventListener('connect', listener)
	}

	processMessage(message) {

	}

	addTensor(tensorId, tensor) {
		this.backend.addTensor(tensorId, tensor)
		this.connector.ack()
	}

	getTensor(tensorId) {
		let tensor = this.backend.getTensor(tensor_id)
		let message = this.processor.makeCommand(tensor)
		this.connector.send(message)
	}

	deleteTensor(tensorId) {
		this.backend.deleteTensor(tensorId)
		this.connector.ack()
	}
}


socket.on('connect', function () {
    console.log('connect', arguments);
    socket.emit('client_id', 'js', (data) => {
        console.log('jopa', data);
    });
    console.log('sent');
});
socket.on('message', function (data) {
    try {
        let message = fromArray(data);
        console.log('processing', message)
        let response = process(message)
        socket.emit.apply(socket, response)
    } catch (e) {
        console.log(e);
    }
    socket.emit['client_ack', 'error']
});
//  socket.on('ping', function() { console.log('ping', arguments); });
//  socket.on('pong', function() { console.log('pong', arguments); });

socket.on('disconnect', function () {
    console.log('disconnent', arguments);
});


let tensors = {}

function process(message) {

    let response = ['client_ack', 'aaa']

    switch (message.command) {
        case 'set':
            let ts = message.arguments[0]
            tensor = tf.tensor(ts.data, ts.shape)
            tensors[ts.id] = tensor
            break

        case 'send':
            let id = message.arguments[0]
            let obj = tensors[id] || null
            if (first === null) {
                throw new Error(`Tensor not found ${arg1.id_at_location}`)
            }

            break

        case 'cmd':
            let [[cmd, arg1, [arg2], _], [res_id]] = message.arguments[0]
            switch (cmd) {
                case '__add__':
                case '__radd__':
                    let first = tensors[arg1.id_at_location] || null
                    if (first === null) {
                        throw new Error(`Tensor not found ${arg1.id_at_location}`)
                    }
                    if (arg2 instanceof SyftTorchTensor) {

                    } else {
                        let second = arg2
                    }
                    console.log('arg2', arg2)
                    let result = first.add(arg2)
                    tensors[res_id] = result
                    console.log(tensors)
                    break
                default:
                    throw new Error(`Unsupported command ${cmd}`)
            }
            break
        default:
            throw new Error(`Unsupported command ${message.command}`)
    }

    return response
}

