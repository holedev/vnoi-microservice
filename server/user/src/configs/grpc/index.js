import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { _PROCESS_ENV, _SERVICE } from "../env/index.js";
import { gRPCHandle } from "../../api/services/grpc.js";
import { sendLogTelegram } from "../../utils/telegram.js";

const gRPCCreateServer = (protoPath, serviceName, serviceHost, servicePort, serviceHandle) => {
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
    server.bindAsync(serviceHost + ":" + servicePort, grpc.ServerCredentials.createInsecure(), () => {
      console.log(
        `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | GRPC ${serviceName.toUpperCase()} server is running`
      );
    });
  } catch (err) {
    sendLogTelegram("GRPC::SERVER\n" + err);
  }
};

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
    sendLogTelegram("GRPC::CLIENT\n" + err);
  }
};

const gRPCServerUser = () =>
  gRPCCreateServer(
    _SERVICE.USER_SERVICE.GRPC_PROTO_PATH,
    _SERVICE.USER_SERVICE.GRPC_SERVICE_NAME,
    _SERVICE.USER_SERVICE.GRPC_HOST,
    _SERVICE.USER_SERVICE.GRPC_PORT,
    gRPCHandle
  );

const grpCClientCommon = gRPCCreateClient(
  _SERVICE.COMMON_SERVICE.GRPC_PROTO_PATH,
  _SERVICE.COMMON_SERVICE.GRPC_SERVICE_NAME,
  _SERVICE.COMMON_SERVICE.GRPC_HOST,
  _SERVICE.COMMON_SERVICE.GRPC_PORT
);

export { gRPCServerUser, grpCClientCommon };
