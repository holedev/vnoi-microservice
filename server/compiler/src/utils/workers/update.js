import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import fsExtra from "fs-extra";
import { getDockerSolutionCommand, getFiles, processSolution } from "../file.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";
import { BadRequestError } from "../../api/responses/errors/BadRequestError.js";
import { handleCodeFromClient } from "../code/C++/index.js";
import { execSync } from "child_process";
import { ConflictError } from "../../api/responses/errors/ConflictError.js";

const { uuid, author, solutionCode, script } = workerData;

const testcases = script.data;
const folderPath = `../store/problems/${author}_${uuid}`;

const { solutionFile, outFile, inputFile } = getFiles(folderPath);

let prevSolutionFile = null;
try {
  prevSolutionFile = fs.readFileSync(solutionFile, "utf-8");
} catch (err) {
  throw new ConflictError("Solution file not exist!!!");
}

fs.writeFileSync(solutionFile, handleCodeFromClient(solutionCode));

try {
  execSync(getDockerSolutionCommand(folderPath));
} catch (error) {
  fs.writeFileSync(solutionFile, prevSolutionFile);
  throw new BadRequestError(error.toString() || "Compilation failed!");
}

if (testcases) {
  const matches = testcases[0].match(/\n/g);

  let inputContent = `${script.quantity} ${matches.length}\n`;
  testcases.forEach((testCase) => {
    inputContent += testCase;
  });

  fs.writeFileSync(inputFile, inputContent);
}

await processSolution(folderPath);
fs.writeFileSync(solutionFile, solutionCode);

try {
  await fsExtra.remove(`${outFile}`);
} catch (err) {
  console.log("FAIL HERE");
  throw new InternalServerError("Error deleting directory!");
}

parentPort.postMessage({
  status: "done"
});
