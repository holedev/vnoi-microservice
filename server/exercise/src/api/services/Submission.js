import { ProblemModel } from "../models/Problem.js";
import { SubmissionModel } from "../models/Submission.js";
import uuidv4 from "uuid4";
import { _ACTION, _PROCESS_ENV, _RESPONSE_SERVICE, _SERVICE } from "../../configs/env/index.js";
import { requestAsync } from "../../configs/rabiitmq/index.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { NotFoundError } from "../responses/errors/NotFoundError.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { gRPCRequest } from "./gRPC.js";

async function getBestSubmission(userId, problemId, withoutSubmissionId) {
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
}

async function deleteByAdmin(submission) {
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
          const bestSubmission = await getBestSubmission(submission.author?._id, submission.problem, submission._id);
          si.submissionId = bestSubmission._id;
          si.maxScore = bestSubmission.score;
        }
      }
      idx++;
    }
    await problem.save();
  }
  await submission.deleteOne();
  await gRPCRequest.deleteSubmissionFolderByUUIDAsync(submission.uuid);
}

const SubmissionService = {
  create: async (req, res) => {
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

    const payload = {
      action: _ACTION.PROBLEM_SUBMIT,
      data: {
        uuid,
        user: _id,
        problem,
        code
      }
    };

    const data = await requestAsync(_SERVICE.COMPILER_SERVICE.NAME, payload);

    if (data.code !== _RESPONSE_SERVICE.SUCCESS) {
      throw new BadRequestError(data.message || "Something went wrong!");
    }

    const result = data.message;

    const score = parseFloat((result.pass / result.total) * 10).toFixed(2);

    const userGRPC = await gRPCRequest.getUserByIdAsync(_id);

    const submission = await SubmissionModel.create({
      author: userGRPC,
      problem: problem._id,
      solution: code,
      pass: `${result.pass}/${result.total}`,
      score,
      uuid,
      time: result.time,
      requestReceivedAt
    });

    if (!submission) {
      throw new ConflictError("Submit failed!");
    }

    if (userSubmission) {
      userSubmission.submissionTotal += 1;
      if (score > userSubmission.maxScore) {
        userSubmission.maxScore = score;
        userSubmission.submissionId = submission._id;
      }
    } else {
      const obj = {
        userId: _id,
        submissionId: submission._id,
        submissionTotal: 1,
        maxScore: score
      };
      problemDoc.submitList.push(obj);
    }

    await problemDoc.save();

    const submitRemain = userSubmission
      ? _PROCESS_ENV.MAX_SUBMISSION - userSubmission?.submissionTotal
      : _PROCESS_ENV.MAX_SUBMISSION - 1;

    const { createdAt, updatedAt, __v, author, problem: pb, uuid: u, ...rest } = submission._doc;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        ...rest,
        submitRemain
      }
    });
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
      .select("_id pass score solution time requestReceivedAt");

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
    let submissions = await SubmissionModel.find()
      .populate({
        path: "problem"
      })
      .lean();

    const { users } = await gRPCRequest.getUsersAvailableAsync();
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
  getFolderInvalid: async (req, res) => {
    const folder = "submissions";
    let submissions = await SubmissionModel.find().lean().select("uuid");

    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    submissions = submissions.map((s) => s.uuid);

    const { count, total } = await gRPCRequest.getCountFolderAsync(folder, submissions, usersList);

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

    await deleteByAdmin(submission);

    return res.status(httpStatusCodes.NO_CONTENT).json({});
  },
  deleteSubmissionWithoutAuthorWithoutProblem: async (req, res) => {
    let submissions = await SubmissionModel.find().populate({
      path: "problem"
    });

    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    submissions = submissions.filter((s) => !s.problem || !usersList.includes(s.author?._id));

    for await (const submission of submissions) {
      await deleteByAdmin(submission);
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: submissions.length
    });
  },
  clearFolderNoAuthorAndSubmissionUUID: async (req, res) => {
    const folder = "submissions";
    let submissions = await SubmissionModel.find().lean().select("uuid");

    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    submissions = submissions.map((s) => s.uuid);

    const length = await gRPCRequest.clearFolderAsync(folder, submissions, usersList);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: length
    });
  }
};

export { SubmissionService };
