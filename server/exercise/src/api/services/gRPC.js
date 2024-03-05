import { grpCClientCommon, grpCClientUser, grpcClientCompiler } from "../../configs/grpc/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

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
  getTestcasesOfProblemAsync: (requestId, problemUuid, problemAuthorId) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.getTestcasesOfProblem({ requestId, problemUuid, problemAuthorId }, (err, res) => {
        if (err) {
          reject({
            statusCode: "GRPC",
            requestId,
            message: err
          });
        } else {
          resolve(res);
        }
      });
    });
  },
  getCountFolderAsync: (requestId, folder, dataArr, dataUser) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.getCountFolder(
        { requestId, folder, dataArr: JSON.stringify(dataArr), dataUser: JSON.stringify(dataUser) },
        (err, res) => {
          if (err) {
            reject({
              statusCode: "GRPC",
              message: err
            });
          } else {
            resolve(res);
          }
        }
      );
    });
  },
  clearFolderAsync: (requestId, folder, dataArr, dataUser) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.clearFolder(
        { requestId, folder, dataArr: JSON.stringify(dataArr), dataUser: JSON.stringify(dataUser) },
        (err, res) => {
          if (err) {
            reject({
              statusCode: "GRPC",
              message: err
            });
          } else {
            resolve(res);
          }
        }
      );
    });
  },
  deleteSubmissionFolderByUUID: (requestId, uuid) => {
    grpcClientCompiler.deleteSubmissionFolderByUUID({ requestId, uuid }, (err, res) => {
      if (err) {
        sendLogTelegram(`GRPC::DELETE_FOLDER\nERROR: ${err}`);
      }
    });
  },
  deleteSubmissionFolderByProblemUUID: (requestId, uuid) => {
    grpcClientCompiler.deleteSubmissionFolderByProblemUUID({ requestId, uuid }, (err, res) => {
      if (err) {
        sendLogTelegram(`GRPC::DELETE_FOLDER\nERROR: ${err}`);
      }
    });
  },
  deleteProblemFolderByUUID: (requestId, uuid) => {
    grpcClientCompiler.deleteProblemFolderByUUID({ requestId, uuid }, (err, res) => {
      if (err) {
        sendLogTelegram(`GRPC::DELETE_FOLDER\nERROR: ${err}`);
      }
    });
  }
};

export { gRPCRequest };
