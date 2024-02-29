import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import fsExtra from "fs-extra";
import { createFolderPath, createSolutionExecutable, getFiles, processSolution } from "../file.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";
import { handleCodeFromClient } from "../code/C++/index.js";

const { uuid, author, solutionCode, script } = workerData;

const testcases = script.data;
const folderPath = await createFolderPath(`../store/problems/${author}_${uuid}`);

const { solutionFile, outFile, inputFile } = getFiles(folderPath);

fs.writeFileSync(solutionFile, handleCodeFromClient(solutionCode));

await createSolutionExecutable(folderPath, true);

const matches = testcases[0].match(/\n/g);

let inputContent = `${script.quantity} ${matches.length}\n`;
testcases.forEach((testCase) => {
  inputContent += testCase;
});

fs.writeFileSync(inputFile, inputContent);
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
