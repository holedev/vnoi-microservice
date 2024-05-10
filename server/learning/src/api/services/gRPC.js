import { grpCClientCommon, grpCClientMedia, grpCClientUser } from "../../configs/grpc/index.js";

const gRPCRequest = {
  getUserByIdAsync: (requestId, _id) => {
    return new Promise((resolve, reject) => {
      grpCClientUser.getUserById({ requestId, _id }, (err, res) => {
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
  },
  getUsersAvailableAsync: (requestId) => {
    return new Promise((resolve, reject) => {
      grpCClientUser.getUsersAvailable({ requestId }, (err, res) => {
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
  },
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
  },
  getVideoByIdAsync: (requestId, _id) => {
    return new Promise((resolve, reject) => {
      grpCClientMedia.getVideoById({ requestId, _id }, (err, res) => {
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

export { gRPCRequest };
