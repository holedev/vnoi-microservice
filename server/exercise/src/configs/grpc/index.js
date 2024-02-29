import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { _PROCESS_ENV } from "../env/index.js";

const _COMPILER_PROTO_PATH = "../protos/compiler.proto";
const _COMPILER_SERVICE_NAME = "Compiler";

const gRPCCreateClient = (protoPath, serviceName) => {
  try {
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const packageDefine = grpc.loadPackageDefinition(packageDefinition)[serviceName.toLowerCase()];

    const client = new packageDefine[serviceName](
      "127.0.0.1:" + _PROCESS_ENV.GRPC_SERVER_PORT,
      grpc.credentials.createInsecure()
    );

    return client;
  } catch (err) {
    console.log(err);
  }
};

const grpcCompilerClient = gRPCCreateClient(_COMPILER_PROTO_PATH, _COMPILER_SERVICE_NAME);

export { grpcCompilerClient };
