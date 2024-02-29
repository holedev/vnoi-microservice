import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { _PROCESS_ENV } from "../env/index.js";
import { CompilerService } from "../../api/services/index.js";

const _COMPILER_PROTO_PATH = "../protos/compiler.proto";
const _COMPILER_SERVICE_NAME = "Compiler";

const gRPCCreateServer = (protoPath, serviceName, serviceHandle) => {
  try {
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const myPackage = grpc.loadPackageDefinition(packageDefinition)[serviceName.toLowerCase()];

    const server = new grpc.Server();
    server.addService(myPackage[serviceName].service, serviceHandle);
    server.bindAsync("localhost:" + _PROCESS_ENV.GRPC_SERVER_PORT, grpc.ServerCredentials.createInsecure(), () => {
      console.log(
        `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | GRPC ${serviceName.toUpperCase()} is running`
      );
    });
  } catch (err) {
    console.log(err);
  }
};

const gRPCServerCompiler = () =>
  gRPCCreateServer(_COMPILER_PROTO_PATH, _COMPILER_SERVICE_NAME, CompilerService.handleGRPC);

const gRPCCreateClient = async () => {};

export { gRPCServerCompiler, gRPCCreateClient };
