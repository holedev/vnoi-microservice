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
import { InternalServerError } from "../responses/errors/InternalServerError.js";
import { ProblemHandle } from "./Problem.js";
import { SubmissionHandle } from "./Submission.js";

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
  createSubmissionBatchTokens: async (submissions) => {
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
      throw new BadRequestError("Create Submissions Batch Tokens Fail!");
    }
  },
  checkTokens: async (tokens) => {
    try {
      const tokenStr = tokens.map((token) => token.token).join(",");
      const _URI = _PROCESS_ENV.COMPILER_HOST + `/submissions/batch?tokens=${tokenStr}&base64_encoded=true`;
      const data = await fetch(_URI, { method: "GET" });

      return data.json();
    } catch (err) {
      throw new BadRequestError("Check Tokens Fail!");
    }
  },
  checkTokensWithArray: async (tokens) => {
    try {
      const tokenStr = tokens.map((token) => token).join(",");
      const _URI =
        _PROCESS_ENV.COMPILER_HOST +
        `/submissions/batch?tokens=${tokenStr}&base64_encoded=true&fields=token,stdin,stdout,time,memory,stderr,compile_output,status`;
      const data = await fetch(_URI, { method: "GET" });

      return data.json();
    } catch (err) {
      throw new BadRequestError("Check Tokens Fail!");
    }
  },
  checkProblemStatus: (uuid, tokens) => {
    try {
      const interval = setInterval(async () => {
        const { submissions } = await judge0Service.checkTokens(tokens);

        if (!submissions || submissions.length === 0) {
          clearInterval(interval);
          throw new BadRequestError("No Submissions Found!");
        }

        const isProcessing = submissions.some((d) => d.status.id < _COMPILER_STATUS.ACCEPTED);

        if (!isProcessing) {
          clearInterval(interval);
          const status = submissions.every(
            (d) => d.status.id === _COMPILER_STATUS.ACCEPTED || d.status.id === _COMPILER_STATUS.WRONG_ANSWER
          )
            ? "success"
            : "error";

          await ProblemHandle.updateProblemStatusByUUID(uuid, status, submissions);
          removeProblemStatus(uuid, "processing");
          setProblemStatus(uuid, status);
        }
      }, _INTERVAL_TIME_MS);
    } catch (err) {
      throw new BadRequestError("Check Interval Problem Status Fail!");
    }
  },
  checkRunConsoleStatus: (uuid, tokens) => {
    try {
      const interval = setInterval(async () => {
        const { submissions } = await judge0Service.checkTokens(tokens);

        if (!submissions || submissions.length === 0) {
          clearInterval(interval);
          throw new BadRequestError("No Submissions Found!");
        }

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
    } catch (err) {
      throw new BadRequestError("Check Interval Run Console Status Fail!");
    }
  },
  checkSubmissionStatus: ({ uuid, tokens, problemId, code, requestReceivedAt, requestId, authorId }) => {
    try {
      const interval = setInterval(async () => {
        const { submissions } = await judge0Service.checkTokens(tokens);

        if (!submissions || submissions.length === 0) {
          clearInterval(interval);
          throw new BadRequestError("No Submissions Found!");
        }

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

          await SubmissionHandle.updateSubmissionByUUID({
            result,
            tokens: tokens.map((t) => t.token),
            requestId,
            _id: authorId,
            requestReceivedAt,
            uuid,
            problemId: problemId,
            code
          });
          setSubmissionStatus(uuid, "results", JSON.stringify(result));
        }
      }, _INTERVAL_TIME_MS);
    } catch (err) {
      throw new BadRequestError("Check Submission Status Fail!");
    }
  },
  deleteSubmission: async (token) => {
    try {
      const _URI = _PROCESS_ENV.COMPILER_HOST + `/submissions/${token}`;
      const res = await fetch(_URI, {
        method: "DELETE",
        headers: {
          "X-Auth-User": _PROCESS_ENV.COMPILER_X_AUTH_USER
        }
      });

      return res.status;
    } catch (err) {
      throw new InternalServerError("Delete Submission Fail!");
    }
  },
  deleteSubmissions: async (tokens) => {
    try {
      if (!tokens || tokens.length === 0) {
        throw new BadRequestError("No Submissions Found!");
      }

      for await (const token of tokens) {
        await judge0Service.deleteSubmission(token);
      }
    } catch (err) {
      throw new BadRequestError("Delete Submissions Fail!");
    }
  }
};

export { judge0Service };
