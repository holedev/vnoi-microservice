import { grpCClientCommon } from "../../configs/grpc/index.js";
import { UserModel } from "../models/User.js";

const gRPCRequest = {
  getClassByIdAsync: (_id) => {
    return new Promise((resolve, reject) => {
      grpCClientCommon.getClassById({ _id }, (err, res) => {
        if (err) {
          reject(err);
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
      const _id = call.request?._id;
      const result = await UserModel.findById(_id).lean().select("_id email fullName role");
      callback(null, result);
    } catch (error) {
      callback(error, null);
    }
  },
  getUsersAvailable: async (call, callback) => {
    try {
      const result = await UserModel.find().lean().select("_id");
      callback(null, { users: JSON.stringify(result) });
    } catch (error) {
      console.log(error);
      callback(error, null);
    }
  }
};

export { gRPCRequest, gRPCHandle };
