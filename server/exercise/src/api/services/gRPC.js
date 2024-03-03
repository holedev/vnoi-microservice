import { grpCClientCommon, grpCClientUser, grpcClientCompiler } from "../../configs/grpc/index.js";

const gRPCRequest = {
  getUserByIdAsync: (_id) => {
    return new Promise((resolve, reject) => {
      grpCClientUser.getUserById({ _id }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  getUsersAvailableAsync: () => {
    return new Promise((resolve, reject) => {
      grpCClientUser.getUsersAvailable({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
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
  },
  getTestcasesOfProblemAsync: (problemUuid, problemAuthorId) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.getTestcasesOfProblem({ problemUuid, problemAuthorId }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  getCountFolderAsync: (folder, dataArr, dataUser) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.getCountFolder(
        { folder, dataArr: JSON.stringify(dataArr), dataUser: JSON.stringify(dataUser) },
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  },
  clearFolderAsync: (folder, dataArr, dataUser) => {
    return new Promise((resolve, reject) => {
      grpcClientCompiler.clearFolder(
        { folder, dataArr: JSON.stringify(dataArr), dataUser: JSON.stringify(dataUser) },
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  },
  deleteSubmissionFolderByUUIDAsync: async (uuid) => {
    grpcClientCompiler.deleteSubmissionFolderByUUID({ uuid }, (err, res) => {
      if (err) {
        console.log(err);
      }
    });
  }
};

export { gRPCRequest };
