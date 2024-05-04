import { ProblemModel } from "../models/Problem.js";
import { SubmissionModel } from "../models/Submission.js";
import uuidv4 from "uuid4";
import { _PROCESS_ENV } from "../../configs/env/index.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { NotFoundError } from "../responses/errors/NotFoundError.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { gRPCRequest } from "./gRPC.js";
import { judge0Service } from "./judge0.js";

const SubmissionHandle = {
  getBestSubmission: async (userId, problemId, withoutSubmissionId) => {
    const submissions = await SubmissionModel.find({
      "author._id": userId,
      problem: problemId
    }).lean();

    let bestSubmission = null;

    for (const submission of submissions) {
      if (withoutSubmissionId) {
        if (submission._id.toString() === withoutSubmissionId.toString()) {
          continue;
        }
      }
      if (!bestSubmission) {
        bestSubmission = submission;
      } else {
        // eslint-disable-next-line no-lonely-if
        if (submission.score > bestSubmission.score) {
          bestSubmission = submission;
        } else if (submission.score === bestSubmission.score) {
          if (new Date(submission.requestReceivedAt) < new Date(bestSubmission.requestReceivedAt)) {
            bestSubmission = submission;
          }
        }
      }
    }
    return bestSubmission;
  },
  deleteByAdmin: async (submission) => {
    const problem = await ProblemModel.findById(submission.problem);
    if (problem && problem.submitList?.length > 0) {
      let idx = 0;
      for await (const si of problem.submitList) {
        if (!si.userId || !submission.author) {
          idx++;
          continue;
        }
        if (si.userId === submission.author?._id) {
          si.submissionTotal -= 1;
          if (si.submissionTotal <= 0) {
            problem.submitList.splice(idx, 1);
          } else {
            const bestSubmission = await SubmissionHandle.getBestSubmission(
              submission.author?._id,
              submission.problem,
              submission._id
            );
            si.submissionId = bestSubmission._id;
            si.maxScore = bestSubmission.score;
          }
        }
        idx++;
      }
      await problem.save();
    }
    await judge0Service.deleteSubmissions(submission.tokens);
    await submission.deleteOne();
  }
};

const SubmissionService = {
  create: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];
    const { problem, code } = req.body;

    const requestReceivedAt = new Date();
    const uuid = uuidv4();

    const problemDoc = await ProblemModel.findOne({
      _id: problem,
      isDeleted: false
    });

    if (!problemDoc) {
      throw new NotFoundError("Problem not found!");
    }

    if (!problemDoc.alwayOpen) {
      if (requestReceivedAt < new Date(problemDoc.timeStart) || requestReceivedAt > new Date(problemDoc.timeEnd)) {
        throw new ConflictError("Problem is not available now!");
      }
    }

    const userSubmission = problemDoc.submitList.find((s) => s.userId?.toString() === _id);

    if (userSubmission && userSubmission.submissionTotal >= _PROCESS_ENV.MAX_SUBMISSION) {
      throw new BadRequestError(
        `You have reached the maximum number of submissions (${_PROCESS_ENV.MAX_SUBMISSION}) for this problem!`
      );
    }

    const submitRemain = userSubmission
      ? _PROCESS_ENV.MAX_SUBMISSION - userSubmission?.submissionTotal
      : _PROCESS_ENV.MAX_SUBMISSION - 1;

    const inputs = problemDoc.testcases.input.split(_PROCESS_ENV.STRING_SPLIT_CODE);
    const outputs = problemDoc.testcases.output.split(_PROCESS_ENV.STRING_SPLIT_CODE);

    if (inputs.length !== outputs.length) {
      throw new BadRequestError("Problem testcases invalid!");
    }

    const submissions = inputs.map((stdin, idx) => {
      return {
        language_id: code.langIdSolution,
        source_code: code.text.trim(),
        stdin: stdin.trim(),
        expected_output: outputs[idx].trim(),
        cpu_time_limit: problem.timeLimit,
        memory_limit: problem.memoryLimit,
        stack_limit: problem.stackLimit
      };
    });

    const submissionTokens = await judge0Service.createSubmissionBatchTokens(submissions);
    judge0Service.checkSubmissionStatus({
      uuid,
      tokens: submissionTokens,
      problemId: problemDoc._id,
      code,
      requestReceivedAt,
      requestId,
      authorId: _id
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        uuid,
        submitRemain
      }
    });
  },
  updateSubmissionByUUID: async ({ result, tokens, requestId, _id, requestReceivedAt, uuid, problemId, code }) => {
    const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, _id);

    const submission = await SubmissionModel.create({
      uuid,
      author: userGRPC,
      problem: problemId,
      langIdSolution: code.langIdSolution,
      solution: code.text.trim(),
      pass: `${result.pass}/${result.total}`,
      score: result.score,
      timeAvg: result.timeAvg,
      memoryAvg: result.memoryAvg,
      requestReceivedAt,
      tokens: tokens
    });

    if (!submission) {
      throw new ConflictError("Submit failed!");
    }

    const problemDoc = await ProblemModel.findOne({
      _id: problemId,
      isDeleted: false
    });

    if (!problemDoc) {
      throw new NotFoundError("Problem not found!");
    }

    if (!problemDoc.alwayOpen) {
      if (requestReceivedAt < new Date(problemDoc.timeStart) || requestReceivedAt > new Date(problemDoc.timeEnd)) {
        throw new ConflictError("Problem is not available now!");
      }
    }

    const userSubmission = problemDoc.submitList.find((s) => s.userId?.toString() === _id);

    if (userSubmission) {
      userSubmission.submissionTotal += 1;
      if (result.score > userSubmission.maxScore) {
        userSubmission.maxScore = result.score;
        userSubmission.submissionId = submission._id;
      }
    } else {
      const obj = {
        userId: _id,
        submissionId: submission._id,
        submissionTotal: 1,
        maxScore: result.score
      };
      problemDoc.submitList.push(obj);
    }

    await problemDoc.save();
  },
  getSubmissionOfUser: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { problem } = req.body;
    const submission = await SubmissionModel.find({
      "author._id": _id,
      problem
    })
      .lean()
      .sort({ requestReceivedAt: -1 })
      .select("uuid pass score solution langIdSolution timeAvg memoryAvg requestReceivedAt");

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: submission
    });
  },
  getAllSubmissionByAdmin: async (req, res) => {
    const { search, page = 1, limit = _PROCESS_ENV.PAGE_SIZE || 9 } = req.query;

    let submissions = await SubmissionModel.find()
      .sort({
        problem: 1
      })
      .select("-createdAt -updatedAt -__v")
      .lean();

    if (search?.trim())
      submissions = submissions.filter(
        (s) =>
          s._id.toString() === search.trim() ||
          s.author?._id === search.trim() ||
          s.problem.toString() === search.trim()
      );

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(submissions.length / Number(limit));
    const currentPage = Number(page);
    submissions = submissions.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: submissions,
      currentPage,
      totalPage
    });
  },
  getSubmissionsWithoutAuthorWithoutProblem: async (req, res) => {
    const requestId = req.headers["x-request-id"];

    let submissions = await SubmissionModel.find()
      .populate({
        path: "problem"
      })
      .lean();

    const { users } = await gRPCRequest.getUsersAvailableAsync(requestId);
    const usersList = JSON.parse(users).map((item) => item._id);

    const total = submissions.length;
    submissions = submissions.filter((s) => !s.problem || !usersList.includes(s.author?._id));
    const count = submissions.length;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        count,
        total
      }
    });
  },
  deleteSubmissionByAdmin: async (req, res) => {
    const { id } = req.params;

    const submission = await SubmissionModel.findById(id);

    if (!submission) {
      throw new ConflictError("Submission not found!");
    }

    await SubmissionHandle.deleteByAdmin(submission);

    return res.status(httpStatusCodes.NO_CONTENT).json({});
  },
  deleteSubmissionWithoutAuthorWithoutProblem: async (req, res) => {
    const requestId = req.headers["x-request-id"];

    let submissions = await SubmissionModel.find().populate({ path: "problem" });

    const { users } = await gRPCRequest.getUsersAvailableAsync(requestId);
    const usersList = JSON.parse(users).map((item) => item._id);

    submissions = submissions.filter((s) => !s.problem || !usersList.includes(s.author?._id));

    for await (const submission of submissions) {
      await SubmissionHandle.deleteByAdmin(submission);
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: submissions.length
    });
  }
};

export { SubmissionService };
