import fs from "fs";
import path from "path";
import { glob } from "glob";
import { execSync } from "child_process";
import { mkdirp } from "mkdirp";
import fsExtra from "fs-extra";
import { _PROCESS_ENV } from "../configs/env/index.js";
import { InternalServerError } from "../api/responses/errors/InternalServerError.js";
import { BadRequestError } from "../api/responses/errors/BadRequestError.js";
import { ConflictError } from "../api/responses/errors/ConflictError.js";

const createFolderPath = async (path) => {
  await mkdirp(path);
  return path;
};

const getFiles = (folderPath) => {
  const solutionFile = `${folderPath}/solution.cpp`;
  const outFile = `${folderPath}/solution`;
  const inputFile = `${folderPath}/input.txt`;
  const outputFile = `${folderPath}/output.txt`;
  return { solutionFile, outFile, inputFile, outputFile };
};

const countFolder = async (folder, dataArr, dataUser) => {
  let count = 0,
    total = 0;
  const pattern = `../store/${folder}/*`;
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    total++;
    const folderName = _PROCESS_ENV.NODE_ENV === "dev" ? path.split("\\").pop() : path.split("/").pop();
    const userId = folderName.split("_")[0];
    const dataId = folderName.split("_")[1];

    if (!dataUser.includes(userId) || !dataArr.includes(dataId)) {
      count++;
    }
  }
  return [count, total];
};

const clearFolder = async (folder, dataArr, dataUser) => {
  let count = 0;
  const pattern = `../store/${folder}/*`;
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    const folderName = _PROCESS_ENV.NODE_ENV === "dev" ? path.split("\\").pop() : path.split("/").pop();
    const userId = folderName.split("_")[0];
    const dataId = folderName.split("_")[1];
    if (!dataUser.includes(userId) || !dataArr.includes(dataId)) {
      count++;
      deleteFolderPath(path);
    }
  }
  return count;
};

const deleteFolderPath = async (folderPath) => {
  try {
    await fsExtra.remove(folderPath);
  } catch (err) {
    throw new InternalServerError("Error deleting directory!");
  }
};

const deleteSubmissionFolderByProblem = async (problemUUID) => {
  const pattern = `../store/submissions/**_**_${problemUUID}/`;
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    deleteFolderPath(path);
  }
};

const deleteProblemFolderByUUID = async (problemUUID) => {
  const pattern = `../store/problems/**_${problemUUID}/`;
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    deleteFolderPath(path);
  }
};

const deleteSubmissionFolderByUUID = async (submissionUUID) => {
  if (!submissionUUID) return;
  const pattern = `../store/submissions/**_${submissionUUID}_**/`;
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    deleteFolderPath(path);
  }
};

const clearSubmissionsFolder = async (submissions, users) => {
  let count = 0;
  const pattern = "../store/submissions/*";
  const folderPath = await glob(pattern);
  for await (const path of folderPath) {
    const folderName = _PROCESS_ENV.NODE_ENV === "dev" ? path.split("\\").pop() : path.split("/").pop();
    const userID = folderName.split("_")[0];
    const submissionID = folderName.split("_")[1];
    if (!users.includes(userID) || !submissions.includes(submissionID)) {
      count++;
      deleteFolderPath(path);
    }
  }
  return count;
};

const getDockerSolutionCommand = (folderPath) => {
  return `docker run --rm --cpus=0.8 --ulimit cpu=${
    _PROCESS_ENV.DOCKER_LIMIT_TIME
  } --memory=${_PROCESS_ENV.DOCKER_LIMIT_MEMORY}m -v ${path.resolve(
    folderPath
  )}:/app ${_PROCESS_ENV.GCC_IMAGE} g++ /app/solution.cpp -o /app/solution`;
};

const getDockerOutputCommand = (folderPath) => {
  return `docker run --rm --cpus=0.8 --ulimit cpu=${
    _PROCESS_ENV.DOCKER_LIMIT_TIME
  } --memory=${_PROCESS_ENV.DOCKER_LIMIT_MEMORY}m -v ${path.resolve(folderPath)}:/app ${_PROCESS_ENV.GCC_IMAGE} /app/solution`;
};

const createSolutionExecutable = async (folderPath, deleteIfFail = false) => {
  try {
    execSync(getDockerSolutionCommand(folderPath));
  } catch (error) {
    if (deleteIfFail) {
      try {
        await fsExtra.remove(folderPath);
      } catch (err) {
        throw new InternalServerError("Error deleting directory!");
      }
    }
    throw new BadRequestError(error.stderr.toString() || "Compilation failed!");
  }
};

const processSolution = async (folderPath) => {
  try {
    execSync(getDockerOutputCommand(folderPath));
  } catch (err) {
    throw new BadRequestError(err.stderr.toString() || "Compilation failed!");
  }
};

const getTestcaseFromFile = async (uuid, author, quantity = 3) => {
  const folderPath = `../store/problems/${author}_${uuid}`;
  const { inputFile, outputFile } = getFiles(folderPath);

  let contentInp, contentOut;

  try {
    contentInp = fs.readFileSync(inputFile, "utf8");
    contentOut = fs.readFileSync(outputFile, "utf8");
  } catch (err) {
    throw new ConflictError("Testcase not found!");
  }

  const dataInpFormat = contentInp.split("\n");
  const linePerTestcase = parseInt(dataInpFormat[0].split(" ")[1]);

  const testcases = [];
  let count = 0;
  for (let i = 0; i < quantity * linePerTestcase; i += linePerTestcase) {
    const obj = {
      input: [],
      output: contentOut.split(_PROCESS_ENV.STRING_SPLIT_TESTCASE)[count]?.split("\n") || []
    };

    for (let j = 0; j < linePerTestcase; j++) {
      obj.input.push(dataInpFormat[j + i + 1]);
    }
    testcases.push(obj);
    count++;
  }
  return testcases;
};

export {
  getDockerSolutionCommand,
  createFolderPath,
  createSolutionExecutable,
  processSolution,
  getFiles,
  getTestcaseFromFile,
  countFolder,
  deleteFolderPath,
  deleteProblemFolderByUUID,
  deleteSubmissionFolderByProblem,
  deleteSubmissionFolderByUUID,
  clearFolder,
  clearSubmissionsFolder
};
