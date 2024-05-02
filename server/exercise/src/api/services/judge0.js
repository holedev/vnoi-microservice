import { _PROCESS_ENV } from "../../configs/env/index.js";
import {
  removeProblemStatus,
  removeRunConsoleStatus,
  setProblemStatus,
  setRunConsoleStatus,
  setSubmissionStatus
} from "../../utils/firebase.js";
import { decode } from "../../utils/judge0.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { ProblemService } from "./Problem.js";
import { SubmissionService } from "./Submission.js";

export const _COMPILER_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: [7, 8, 9, 10, 11, 12],
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14
};
const _INTERVAL_TIME_MS = 1000;

const judge0Service = {
  getSubmissionBatchTokens: async (submissions) => {
    try {
      const tokens = await fetch(_PROCESS_ENV.COMPILER_HOST + "/submissions/batch?redirect_stderr_to_stdout=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          submissions
        })
      });

      return tokens.json();
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Compiler fail!");
    }
  },
  checkTokens: async (tokens) => {
    try {
      const tokenStr = tokens.map((token) => token.token).join(",");
      const _URI = _PROCESS_ENV.COMPILER_HOST + `/submissions/batch?tokens=${tokenStr}&base64_encoded=true`;
      const data = await fetch(_URI, {
        method: "GET"
      });

      return data.json();
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Compiler fail!");
    }
  },
  checkProblemStatus: (uuid, tokens) => {
    const interval = setInterval(async () => {
      const { submissions } = await judge0Service.checkTokens(tokens);

      const isProcessing = submissions.some((d) => d.status.id < _COMPILER_STATUS.ACCEPTED);

      if (!isProcessing) {
        clearInterval(interval);
        const status = submissions.every(
          (d) => d.status.id === _COMPILER_STATUS.ACCEPTED || d.status.id === _COMPILER_STATUS.WRONG_ANSWER
        )
          ? "success"
          : "error";

        await ProblemService.updateProblemStatusByUUID(uuid, status, submissions);
        removeProblemStatus(uuid, "processing");
        setProblemStatus(uuid, status);
      }
    }, _INTERVAL_TIME_MS);
  },
  checkRunConsoleStatus: (uuid, tokens) => {
    const interval = setInterval(async () => {
      const { submissions } = await judge0Service.checkTokens(tokens);

      const isProcessing = submissions.some((d) => d.status.id < _COMPILER_STATUS.ACCEPTED);

      if (!isProcessing) {
        clearInterval(interval);

        const total = submissions.length;
        const data = [];
        let timeAvg = 0;
        let memoryAvg = 0;
        let pass = 0;

        submissions.forEach((s) => {
          const obj = {
            status: s.status.description,
            stdout: decode(s.stdout) || decode(s.stderr) || decode(s.compile_output) || decode(s.message),
            pass: s.status.id === _COMPILER_STATUS.ACCEPTED
          };
          data.push(obj);

          if (s.status.id === _COMPILER_STATUS.ACCEPTED || s.status.id === _COMPILER_STATUS.WRONG_ANSWER) {
            timeAvg += parseFloat(s.time);
            memoryAvg += parseFloat(s.memory);
          }

          if (s.status.id === _COMPILER_STATUS.ACCEPTED) pass++;
        });

        const message = {
          data,
          timeAvg: (timeAvg / total).toFixed(4),
          memoryAvg: (memoryAvg / total).toFixed(0),
          pass: `${pass}/${total}`
        };

        removeRunConsoleStatus(uuid, "processing");
        setRunConsoleStatus(uuid, "results", JSON.stringify(message));
      }
    }, _INTERVAL_TIME_MS);
  },
  checkSubmissionStatus: (uuid, tokens, problem, code, requestReceivedAt, requestId, _id) => {
    const interval = setInterval(async () => {
      const { submissions } = await judge0Service.checkTokens(tokens);

      const isProcessing = submissions.some((d) => d.status.id < _COMPILER_STATUS.ACCEPTED);

      if (!isProcessing) {
        clearInterval(interval);

        const totalSubmission = submissions.length;
        let totalTime = 0;
        let totalMemory = 0;
        let pass = 0;

        submissions.forEach((s) => {
          if (s.status.id === _COMPILER_STATUS.ACCEPTED || s.status.id === _COMPILER_STATUS.WRONG_ANSWER) {
            totalTime += parseFloat(s.time);
            totalMemory += parseFloat(s.memory);
          }

          if (s.status.id === _COMPILER_STATUS.ACCEPTED) pass++;
        });

        const result = {
          uuid,
          pass,
          total: totalSubmission,
          timeAvg: (totalTime / totalSubmission).toFixed(4),
          memoryAvg: (totalMemory / totalSubmission).toFixed(0),
          score: parseFloat((pass / totalSubmission) * 10).toFixed(2),
          requestReceivedAt,
          solution: code.text.trim(),
          langIdSolution: code.langIdSolution
        };

        await SubmissionService.updateSubmissionByUUID({
          result,
          tokens: tokens.map((t) => t.token),
          requestId,
          _id,
          requestReceivedAt,
          uuid,
          problemId: problem._id,
          code
        });
        setSubmissionStatus(uuid, "results", JSON.stringify(result));
      }
    }, _INTERVAL_TIME_MS);
  }
};

export { judge0Service };
