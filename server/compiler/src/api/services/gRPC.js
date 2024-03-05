import { logInfo } from "../../configs/rabiitmq/log.js";
import {
  clearFolder,
  countFolder,
  deleteProblemFolderByUUID,
  deleteSubmissionFolderByProblemUUID,
  deleteSubmissionFolderByUUID,
  getTestcaseFromFile
} from "../../utils/file.js";

const logGRPCHandle = (requestId, method, body) => logInfo(null, { requestId, method, body });

const gRPCHandle = {
  getTestcasesOfProblem: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { problemUuid, problemAuthorId } = call.request;
      const testcases = await getTestcaseFromFile(problemUuid, problemAuthorId);
      callback(null, { testcases: JSON.stringify(testcases) });
    } catch (err) {
      callback(err, null);
    }
  },
  getCountFolder: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { folder, dataArr, dataUser } = call.request;
      const [count, total] = await countFolder(folder, JSON.parse(dataArr), JSON.parse(dataUser));
      callback(null, { count, total });
    } catch (err) {
      callback(err, null);
    }
  },
  clearFolder: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { folder, dataArr, dataUser } = call.request;
      const length = await clearFolder(folder, JSON.parse(dataArr), JSON.parse(dataUser));
      callback(null, { length });
    } catch (err) {
      callback(err, null);
    }
  },
  deleteSubmissionFolderByUUID: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { uuid } = call.request;
      await deleteSubmissionFolderByUUID(uuid);
      callback(null, {});
    } catch (err) {
      callback(err, null);
    }
  },
  deleteSubmissionFolderByProblemUUID: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { uuid } = call.request;
      await deleteSubmissionFolderByProblemUUID(uuid);
      callback(null, {});
    } catch (err) {
      callback(err, null);
    }
  },
  deleteProblemFolderByUUID: async (call, callback) => {
    try {
      logGRPCHandle(call.request.requestId, "GRPC-HANDLE", call.request);
      const { uuid } = call.request;
      await deleteProblemFolderByUUID(uuid);
      callback(null, {});
    } catch (err) {
      callback(err, null);
    }
  }
};

export { gRPCHandle };
