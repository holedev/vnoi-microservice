import { clearFolder, countFolder, deleteSubmissionFolderByUUID, getTestcaseFromFile } from "../../utils/file.js";

const gRPCHandle = {
  getTestcasesOfProblem: async (call, callback) => {
    try {
      const { problemUuid, problemAuthorId } = call.request;
      const testcases = await getTestcaseFromFile(problemUuid, problemAuthorId);
      callback(null, { testcases: JSON.stringify(testcases) });
    } catch (err) {
      console.log(err);
      callback(err, null);
    }
  },
  getCountFolder: async (call, callback) => {
    try {
      const { folder, dataArr, dataUser } = call.request;
      const [count, total] = await countFolder(folder, JSON.parse(dataArr), JSON.parse(dataUser));
      callback(null, { count, total });
    } catch (err) {
      console.log(err);
      callback(err, null);
    }
  },
  clearFolder: async (call, callback) => {
    try {
      const { folder, dataArr, dataUser } = call.request;
      const length = await clearFolder(folder, JSON.parse(dataArr), JSON.parse(dataUser));
      callback(null, { length });
    } catch (err) {
      console.log(err);
      callback(err, null);
    }
  },
  deleteSubmissionFolderByUUID: async (call, callback) => {
    try {
      const { uuid } = call.request;
      await deleteSubmissionFolderByUUID(uuid);
      callback(null, {});
    } catch (err) {
      console.log(err);
      callback(err, null);
    }
  }
};

export { gRPCHandle };
