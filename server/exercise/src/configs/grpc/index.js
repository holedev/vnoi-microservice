import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { _PROCESS_ENV, _SERVICE } from "../env/index.js";

const gRPCCreateClient = (protoPath, serviceName, serviceHost, servicePort) => {
  try {
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const packageDefine = grpc.loadPackageDefinition(packageDefinition)[serviceName.toLowerCase()];

    const client = new packageDefine[serviceName](serviceHost + ":" + servicePort, grpc.credentials.createInsecure());
    console.log(
      `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | GRPC ${serviceName.toUpperCase()} client is running`
    );
    return client;
  } catch (err) {
    console.log(err);
  }
};

const grpCClientCommon = gRPCCreateClient(
  _SERVICE.COMMON_SERVICE.GRPC_PROTO_PATH,
  _SERVICE.COMMON_SERVICE.GRPC_SERVICE_NAME,
  _SERVICE.COMMON_SERVICE.GRPC_HOST,
  _SERVICE.COMMON_SERVICE.GRPC_PORT
);

const grpCClientUser = gRPCCreateClient(
  _SERVICE.USER_SERVICE.GRPC_PROTO_PATH,
  _SERVICE.USER_SERVICE.GRPC_SERVICE_NAME,
  _SERVICE.USER_SERVICE.GRPC_HOST,
  _SERVICE.USER_SERVICE.GRPC_PORT
);

const grpcClientCompiler = gRPCCreateClient(
  _SERVICE.COMPILER_SERVICE.GRPC_PROTO_PATH,
  _SERVICE.COMPILER_SERVICE.GRPC_SERVICE_NAME,
  _SERVICE.COMPILER_SERVICE.GRPC_HOST,
  _SERVICE.COMPILER_SERVICE.GRPC_PORT
);

export { grpCClientCommon, grpCClientUser, grpcClientCompiler };
