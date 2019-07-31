const MSGTYPE_CMD = 1
const MSGTYPE_OBJ = 2
const MSGTYPE_OBJ_REQ = 3
const MSGTYPE_OBJ_DEL = 4
const MSGTYPE_EXCEPTION = 5
const MSGTYPE_IS_NONE = 6
const MSGTYPE_GET_SHAPE = 7
const MSGTYPE_SEARCH = 8
const MSGTYPE_FORCE_OBJ_DEL = 9

class SyftMessage {

    constructor(op, args) {
        this.op = op
        this.args = args
    }

    static fromBinary(blob) {
        let data = new Uint8Array(blob)
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
        return new SyftMessage(unpacked[0], unpacked[1])
    }

    toBinary() {
        let payload
        if (this.op) {
            payload = simplify(PyTuple.from([this.op, this.args]))
        } else {
            payload = simplify(this.args)
        }

        let encoded = MessagePack.encode(payload)

        // add compression
        let result = new Uint8Array(encoded.length + 1)
        result.set(Uint8Array.of(COMPRESSION_NONE), 0)
        result.set(encoded, 1)
        return result.buffer
    }

}

