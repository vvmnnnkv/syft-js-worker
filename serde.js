const COMPRESSION_LZ4 = 41
const COMPRESSION_ZSTD = 42
const COMPRESSION_NONE = 40

const OP_COMMAND = 1
const OP_OBJECT = 2
const OP_OBJECT_REQUEST = 3
const OP_OBJECT_DEL = 4
const OP_OBJECT_FORCE_DEL = 9

class PyDict extends Object {

    static detail(worker, obj) {
        let dict = new PyDict
        for (let item of obj) {
            let [key, value] = item
            key = detail(worker, key)
            value = detail(worker, value)
            dict[key] = value
        }
        console.log('dict', dict)
        return dict
    }

}

class PyList {

}

class PyRange {

}

class PySet {

}

class PySlice {

}

class PyTuple extends Array {

    constructor(items) {
        super(items)
    }

    static simplify() {

    }

    static detail(worker, obj) {
        let items = []
        for (let item of obj) {
            items.push(detail(worker, item))
        }
        return PyTuple.from(items)
    }
}

class SyftTorchTensor {
    id = null
    data = null
    shape = null

    constructor(id, data, shape) {
        this.id = id
        this.shape = shape
        this.data = data
    }

    static detail(worker, obj) {
        console.log('tens det', obj)
        let tensorBuff = Uint8Array.from(obj[1])
        let tensor = fromArrayBuffer(tensorBuff.buffer, tensorBuff.byteOffset)
        return new SyftTorchTensor(obj[0], tensor.data, tensor.shape)
    }
}

class SyftPointerTensor {

    constructor(location, id_at_location, owner, id, shape, garbage_collect_data) {
        this.location = location
        this.id_at_location = id_at_location
        this.owner = owner
        this.id = id
        this.shape = shape
        this.garbage_collect_data = garbage_collect_data
    }

    static detail(worker, obj) {
        let [obj_id,
            id_at_location,
            worker_id,
            point_to_attr,
            shape,
            garbage_collect_data] = obj

        return new SyftPointerTensor(
            worker_id,
            id_at_location,
            worker,
            obj_id,
            shape,
            garbage_collect_data
        )
    }
}

class SyftMessageParseError extends Error {}

const simplifiers = {
    6: PyTuple.simplify
}

const detailers = {
    0: PyDict.detail,
    1: (worker, obj) => Array.from(obj),
    5: (worker, obj) => String(obj),
    6: PyTuple.detail,
    12: SyftTorchTensor.detail,
    18: SyftPointerTensor.detail
}

function simplify(obj) {

}

function detail(worker, obj) {
    console.log('detail: ', obj)
    if (Array.isArray(obj)) {
        if (typeof detailers[obj[0]] === "undefined") {
            throw Error(`no detailer for ${obj[0]}`)
        }
        return detailers[obj[0]](worker, obj[1])
    }
    return obj
}

