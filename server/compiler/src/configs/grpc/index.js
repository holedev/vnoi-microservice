import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { _PROCESS_ENV, _SERVICE } from "../env/index.js";
import { gRPCHandle } from "../../api/services/gRPC.js";

const gRPCCreateServer = (protoPath, serviceName, servicePort, serviceHandle) => {
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
    server.bindAsync("localhost:" + servicePort, grpc.ServerCredentials.createInsecure(), () => {
      console.log(
        `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | GRPC ${serviceName.toUpperCase()} server is running`
      );
    });
  } catch (err) {
    console.log(err);
  }
};

const gRPCServerCompiler = () =>
  gRPCCreateServer(
    _SERVICE.COMPILER_SERVICE.GRPC_PROTO_PATH,
    _SERVICE.COMPILER_SERVICE.GRPC_SERVICE_NAME,
    _SERVICE.COMPILER_SERVICE.GRPC_PORT,
    gRPCHandle
  );

const gRPCCreateClient = async () => {};

export { gRPCServerCompiler, gRPCCreateClient };
