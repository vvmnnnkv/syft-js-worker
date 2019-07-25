
  let lastSetMessage
  const socket = io('http://localhost:5000/');
  socket.on('connect', function() { 
	console.log('connect', arguments); 
	socket.emit('client_id', 'js', (data) => { console.log('jopa', data); }); 
	console.log('sent');  
  });
  socket.on('message', function(data) { 
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

  socket.on('disconnect', function() { console.log('disconnent', arguments); });


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

