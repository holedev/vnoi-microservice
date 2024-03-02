import { grpCClientCommon } from "../../configs/grpc/index.js";

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

export { gRPCRequest };
