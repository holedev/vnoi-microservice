import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import fsExtra from "fs-extra";
import { getDockerSolutionCommand, getFiles, processSolution } from "../file.js";
import InternalServerError from "../../api/response/errors/InternalServerError.js";
import BadRequestError from "../../api/response/errors/BadRequestError.js";
import { handleCodeFromClient } from "../code/C++/index.js";
import { execSync } from "child_process";

const { uuid, author, solutionCode, script } = workerData;

const testcases = script.data;
const folderPath = `../store/problems/${author}_${uuid}`;

const { solutionFile, outFile, inputFile } = getFiles(folderPath);

const prevSolutionFile = fs.readFileSync(solutionFile, "utf-8");
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
  throw new InternalServerError("Error deleting directory!");
}

parentPort.postMessage({
  status: "done"
});
