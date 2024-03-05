import { logInfo } from "../../configs/rabiitmq/log.js";
import { ClassModel } from "../models/class.js";

const logGRPCHandle = (requestId, method, body) => logInfo(null, { requestId, method, body });

const gRPCHandle = {
  getClassById: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const _id = call.request._id;
      const result = await ClassModel.findById(_id).lean();
      callback(null, result);
    } catch (error) {
      callback(error, null);
    }
  }
};

export { gRPCHandle };
