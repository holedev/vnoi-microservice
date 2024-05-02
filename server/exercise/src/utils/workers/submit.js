import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import fsExtra from "fs-extra";
import { createFolderPath, createSolutionExecutable, getFiles, processSolution } from "../file.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";
import { handleCodeFromClient } from "../code/C++/index.js";
import { _PROCESS_ENV } from "../../configs/env/index.js";

const { uuid, user, problem, code } = workerData;

const folderPath = `../store/submissions/${user}_${uuid}_${problem.uuid}`;
const submissionPath = await createFolderPath(folderPath);
const problemPath = `../store/problems/${problem.author}_${problem.uuid}`;

const {
  solutionFile: submissionSolutionFile,
  outFile: submissionOutFile,
  inputFile: submissionInputFile,
  outputFile: submissionOutputFile
} = getFiles(submissionPath);
const { inputFile: problemInputFile, outputFile: problemOutFile } = getFiles(problemPath);

fs.copyFileSync(problemInputFile, submissionInputFile);
fs.writeFileSync(submissionSolutionFile, handleCodeFromClient(code));

await createSolutionExecutable(submissionPath, true);

const start = Date.now();
await processSolution(submissionPath);
const duration = Date.now() - start;

const expectData = fs.readFileSync(problemOutFile, "utf-8").split(_PROCESS_ENV.STRING_SPLIT_TESTCASE);
expectData.pop();

const outData = fs.readFileSync(submissionOutputFile, "utf-8").split(_PROCESS_ENV.STRING_SPLIT_TESTCASE);
outData.pop();

let passQuantity = 0;
expectData.forEach((ep, idx) => {
  if (ep?.toString() === outData[idx]?.toString()) {
    passQuantity++;
  }
});

try {
  await fsExtra.remove(`${submissionOutFile}`);
} catch (err) {
  throw new InternalServerError("Error deleting directory!");
}

fs.writeFileSync(submissionSolutionFile, code);

parentPort.postMessage({
  time: duration,
  pass: passQuantity,
  total: expectData.length
});
