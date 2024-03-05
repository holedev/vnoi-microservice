import { grpCClientCommon } from "../../configs/grpc/index.js";
import { logInfo } from "../../configs/rabiitmq/log.js";
import { UserModel } from "../models/User.js";

const logGRPCHandle = (requestId, method, body) => logInfo(null, { requestId, method, body });

const gRPCRequest = {
  getClassByIdAsync: (requestId, _id) => {
    return new Promise((resolve, reject) => {
      grpCClientCommon.getClassById({ requestId, _id }, (err, res) => {
        if (err) {
          reject({
            statusCode: "GRPC",
            message: err
          });
        } else {
          resolve(res);
        }
      });
    });
  }
};

const gRPCHandle = {
  getUserById: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const _id = call.request?._id;
      const result = await UserModel.findById(_id).lean().select("_id email fullName role");
      callback(null, result);
    } catch (error) {
      callback(error, null);
    }
  },
  getUsersAvailable: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const result = await UserModel.find().lean().select("_id");
      callback(null, { users: JSON.stringify(result) });
    } catch (error) {
      callback(error, null);
    }
  }
};

export { gRPCRequest, gRPCHandle };
