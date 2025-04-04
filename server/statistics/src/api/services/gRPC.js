import { grpCClientCommon, grpCClientLearning, grpCClientUser } from "../../configs/grpc/index.js";
import { logInfo } from "../../configs/rabiitmq/log.js";
import { CourseStatisticModel } from "../models/CourseStatistics.js";

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
  getCourseByIdAsync: (requestId, _id) => {
    return new Promise((resolve, reject) => {
      grpCClientLearning.getCourseById({ requestId, _id }, (err, res) => {
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
  getListLessonIdDone: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { userId, courseId } = call.request;
      const result = await CourseStatisticModel.findOne({
        "user._id": userId,
        "course._id": courseId
      })
        .select("lessonDoneList")
        .lean();

      const data = result?.lessonDoneList || [];
      callback(null, { jsonStr: JSON.stringify(data) });
    } catch (error) {
      callback(error, null);
    }
  }
};

export { gRPCRequest, gRPCHandle };
