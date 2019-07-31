import torch
import syft as sy
from grid.workers.socketio_server import WebsocketIOServerWorker

# Use Numpy serialization strategy
sy.serde._serialize_tensor = sy.serde.numpy_tensor_serializer
sy.serde._deserialize_tensor = sy.serde.numpy_tensor_deserializer
sy.serde._apply_compress_scheme = sy.serde.apply_no_compression

if __name__ == "__main__":
    hook = sy.TorchHook(torch)
    server_worker = WebsocketIOServerWorker(hook, "localhost", 5000, log_msgs=True)
    server_worker.start()
