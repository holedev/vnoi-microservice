import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import fsExtra from "fs-extra";
import { createFolderPath, createSolutionExecutable, getFiles, processSolution } from "../file.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";
import { _PROCESS_ENV } from "../../configs/env/index.js";
import { handleCodeFromClient } from "../code/C++/index.js";

const { uuid, user, problem, code, testcases } = workerData;

const codeHandle = handleCodeFromClient(code);

const folderPath = `../store/run/${user}_${uuid}`;
const runPath = await createFolderPath(folderPath);
const problemPath = `../store/problems/${problem.author}_${problem.uuid}`;

const { solutionFile: runSolutionFile, inputFile: runInputFile, outputFile: runOutputFile } = getFiles(runPath);
const { solutionFile } = getFiles(problemPath);

fs.writeFileSync(runSolutionFile, codeHandle);

await createSolutionExecutable(runPath, true);

const quantity = testcases.input.length;
const linePerTestcase = testcases.input[0].match(/\n/g).length;

let inputContent = `${quantity} ${linePerTestcase}\n`;
testcases.input.forEach((testcase) => {
  inputContent += testcase;
});

const start = Date.now();
fs.writeFileSync(runInputFile, inputContent);

await processSolution(runPath);

const duration = Date.now() - start;
let outValues = fs.readFileSync(runOutputFile, "utf-8");
outValues = outValues.split(_PROCESS_ENV.STRING_SPLIT_TESTCASE);
outValues.pop();

let passQuantity = 0;
const results = outValues.map((item, index) => {
  const isPass = testcases.output[index]?.toString() === item?.split("\n").toString();
  isPass ? (passQuantity += 1) : null;
  return {
    expect: testcases.output[index],
    result: item.split("\n"),
    pass: isPass ? true : false
  };
});

try {
  await fsExtra.remove(folderPath);
} catch (err) {
  throw new InternalServerError("Error deleting directory!");
}

parentPort.postMessage({
  time: parseFloat(duration / 1000).toFixed(2),
  pass: `${passQuantity}/${results.length}`,
  data: results
});
