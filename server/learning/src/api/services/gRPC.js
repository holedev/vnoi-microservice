import { grpCClientCommon, grpCClientMedia, grpCClientStatistics, grpCClientUser } from "../../configs/grpc/index.js";
import { logInfo } from "../../configs/rabiitmq/log.js";
import { CourseModel } from "../models/Course.js";

const logGRPCHandle = (requestId, method, body) => logInfo(null, { requestId, method, body });

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
  },
  getListLessonIdDoneAsync: (requestId, userId, courseId) => {
    return new Promise((resolve, reject) => {
      grpCClientStatistics.getListLessonIdDone({ requestId, userId, courseId }, (err, res) => {
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
  getCourseById: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const _id = call.request._id;
      const result = await CourseModel.findById(_id).lean().select("-__v -createdAt");
      callback(null, { jsonStr: JSON.stringify(result) });
    } catch (error) {
      callback(error, null);
    }
  }
};

export { gRPCRequest, gRPCHandle };
