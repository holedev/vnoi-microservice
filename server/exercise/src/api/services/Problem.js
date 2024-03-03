import { _ACTION, _PROCESS_ENV, _RESPONSE_SERVICE, _SERVICE } from "../../configs/env/index.js";
import { ProblemModel } from "../models/Problem.js";
import { SubmissionModel } from "../models/Submission.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import uuidv4 from "uuid4";
import { requestAsync } from "../../configs/rabiitmq/index.js";
import { gRPCRequest } from "./gRPC.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { handleTime } from "../../utils/index.js";

const _COMPETITION_CLASS_NAME = "COMPETITION";

const ProblemService = {
  create: async (req, res) => {
    const _id = req.headers["x-user-id"];

    const {
      title,
      classCurr,
      timeStart = null,
      testTime = null,
      level,
      desc,
      initCode,
      solution,
      script,
      alwayOpen
    } = req.body;

    const uuid = uuidv4();
    let solutionCode = solution.slice(3, -3);

    const payload = {
      action: _ACTION.PROBLEM_CREATE,
      data: {
        uuid,
        author: _id,
        solutionCode,
        script
      }
    };

    const data = await requestAsync(_SERVICE.COMPILER_SERVICE.NAME, payload);

    if (data.code !== _RESPONSE_SERVICE.SUCCESS) {
      throw new BadRequestError(data.message || "Something went wrong!");
    }

    const classGRPC = await gRPCRequest.getClassByIdAsync(classCurr);
    if (!classGRPC._id) {
      throw new ConflictError("Get class fail!");
    }

    const userGRPC = await gRPCRequest.getUserByIdAsync(_id);
    if (!userGRPC._id) {
      throw new ConflictError("Get user fail!");
    }

    const dataCreate = {
      title,
      uuid,
      author: userGRPC,
      class: classGRPC,
      timeStart: alwayOpen ? null : timeStart,
      testTime: alwayOpen ? null : testTime,
      level,
      desc,
      initCode,
      solution,
      testcases: {
        generateCode: script.generateCode ? script.generateCode : null,
        quantity: parseInt(script.quantity),
        file: script.file
      },
      alwayOpen
    };

    const problem = await ProblemModel.create(dataCreate);

    return res.status(httpStatusCodes.CREATED).json({
      status: "success",
      data: problem._doc
    });
  },
  runTest: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { problem, code, testcases } = req.body;
    const uuid = uuidv4();

    const payload = {
      action: _ACTION.PROBLEM_RUN,
      data: {
        uuid,
        user: _id,
        problem,
        code,
        testcases
      }
    };

    const data = await requestAsync(_SERVICE.COMPILER_SERVICE.NAME, payload);

    if (data.code !== _RESPONSE_SERVICE.SUCCESS) {
      throw new BadRequestError(data.message || "Something went wrong!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: data.message
    });
  },
  updateProblemByLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { slug } = req.params;
    const {
      title,
      classCurr,
      timeStart = null,
      testTime = null,
      level,
      desc,
      initCode,
      solution,
      script,
      uuid,
      alwayOpen
    } = req.body;

    let solutionCode = solution.slice(3, -3);

    const payload = {
      action: _ACTION.PROBLEM_UPDATE,
      data: {
        uuid,
        author: _id,
        solutionCode,
        script
      }
    };

    const data = await requestAsync(_SERVICE.COMPILER_SERVICE.NAME, payload);

    if (data.code !== _RESPONSE_SERVICE.SUCCESS) {
      throw new BadRequestError(data.message || "Something went wrong");
    }

    const classGRPC = await gRPCRequest.getClassByIdAsync(classCurr);
    if (!classGRPC._id) {
      throw new ConflictError("Get class fail!");
    }

    const userGRPC = await gRPCRequest.getUserByIdAsync(_id);
    if (!userGRPC._id) {
      throw new ConflictError("Get user fail!");
    }

    const updateData = {
      title,
      author: userGRPC,
      class: classGRPC,
      timeStart: alwayOpen ? null : timeStart,
      testTime: alwayOpen ? null : testTime,
      level,
      desc,
      initCode,
      solution,
      testcases: {
        generateCode: script.generateCode ? script.generateCode : null,
        quantity: parseInt(script.quantity),
        file: script.file
      },
      alwayOpen
    };

    const problem = await ProblemModel.findOneAndUpdate({ slug, isDeleted: false }, updateData, { new: true })
      .select("-createdAt -updatedAt -__v -solution")
      .lean();

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problem
    });
  },
  getBySlug: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    const { slug } = req.params;

    let problem = await ProblemModel.findOne({
      slug,
      isDeleted: false
    })
      .lean()
      .select("-createdAt -updatedAt -__v -solution");

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    if (!problem.alwayOpen && role === "STUDENT") {
      const currentTime = new Date();
      const timeStart = new Date(problem.timeStart);
      if (currentTime < timeStart) {
        throw new ConflictError(`Problem is available from ${handleTime(timeStart)}!`);
      }
    }

    const quantitySubmit = problem.submitList?.find((s) => s.userId?.toString() === _id)?.submissionTotal;

    const submitRemain = Number(
      quantitySubmit ? _PROCESS_ENV.MAX_SUBMISSION - quantitySubmit : _PROCESS_ENV.MAX_SUBMISSION
    );

    const { submitList, ...rest } = problem;

    const { testcases } = await gRPCRequest.getTestcasesOfProblemAsync(problem.uuid, problem.author._id);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        problem: {
          ...rest,
          submitRemain
        },
        testcases: JSON.parse(testcases)
      }
    });
  },
  getAllProblem: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { search, class: classCurr, status, time, page = 1, limit = _PROCESS_ENV.PAGE_SIZE } = req.query;

    let problems = await ProblemModel.find({
      "class.name": {
        $ne: _COMPETITION_CLASS_NAME
      },
      isDeleted: false
    })
      .sort({
        timeStart: -1
      })
      .lean()
      .select("title author class timeStart testTime timeEnd level slug submitList");

    problems = problems.map((p) => {
      const isSubmit = !!p.submitList?.find((s) => s.userId === _id);
      const { submitList, ...rest } = p;
      return {
        ...rest,
        isSubmit
      };
    });

    if (problems.length === 0) {
      return res.status(httpStatusCodes.OK).json({
        status: "success",
        data: [],
        currentPage: 1,
        totalPage: 0
      });
    }

    if (search?.trim()) problems = problems.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

    if (classCurr && classCurr !== "all") problems = problems.filter((p) => p.class?._id == classCurr);

    if (status && status !== "all") problems = problems.filter((p) => p.isSubmit.toString() === status);

    if (time && time !== "all") {
      const currentTime = new Date();
      switch (parseInt(time)) {
        case 1: {
          // upcoming
          problems = problems.filter((p) => new Date(p.timeStart) > currentTime);
          break;
        }
        case 2: {
          // now
          problems = problems.filter(
            (p) =>
              (new Date(p.timeStart) <= currentTime && new Date(p.timeEnd) >= currentTime) ||
              (!p.timeStart && !p.testTime)
          );
          break;
        }
        case 3: {
          // finished
          problems = problems.filter((p) => {
            const timeEnd = new Date(p.timeEnd);
            return timeEnd.getFullYear() != 1970 && timeEnd < currentTime;
          });
          break;
        }
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(problems.length / Number(limit));
    const currentPage = Number(page);
    problems = problems.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problems,
      currentPage,
      totalPage
    });
  },
  getCompetitionProblem: async (req, res) => {
    const _id = req.headers["x-user-id"];

    let data = await ProblemModel.find({
      "class.name": _COMPETITION_CLASS_NAME,
      isDeleted: false
    })
      .sort({
        timeStart: -1,
        title: 1
      })
      .lean()
      .select("_id title author class timeStart testTime timeEnd level slug submitList");

    data = data.map((p) => {
      const isSubmit = !!p.submitList?.find((s) => s.userId?.toString() === _id);
      const score = p.submitList?.find((s) => s.userId?.toString() === _id)?.maxScore;
      const { submitList, ...rest } = p;
      return {
        ...rest,
        isSubmit,
        score
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: data
    });
  },
  getRankCompetition: async (req, res) => {
    let problems = await ProblemModel.find({
      "class.name": _COMPETITION_CLASS_NAME,
      isDeleted: false
    })
      .populate({
        path: "submitList.submissionId",
        select: "-createdAt -updatedAt -__v -author -problem"
      })
      .populate({
        path: "submitList.userId",
        select: "_id fullName email"
      })
      .sort({
        timeStart: 1,
        title: 1
      })
      .lean()
      .select("_id title submitList");

    const problemListName = problems.map((p) => p.title);

    let results = {};
    for (const p of problems) {
      const title = p.title;

      if (!p.submitList || p.submitList.length === 0) {
        continue;
      }

      for (const submission of p.submitList) {
        const userId = submission.userId;
        if (!userId) {
          continue;
        }
        if (!results[userId]) {
          const userGRPC = await gRPCRequest.getUserByIdAsync(userId);
          if (!userGRPC._id) continue;

          results[userId] = {
            user: {
              email: userGRPC.email,
              fullName: userGRPC.fullName
            },
            data: {}
          };
        }
        results[userId].data[title] = {
          solution: submission.submissionId.solution,
          score: submission.submissionId.score,
          requestReceivedAt: submission.submissionId.requestReceivedAt,
          submitTotal: submission.submissionTotal
        };
        results[userId].totalScore = Object.values(results[userId].data).reduce((acc, curr) => {
          return acc + Number(curr.score);
        }, 0);
        results[userId].totalTime = Object.values(results[userId].data).reduce((acc, curr) => {
          return acc + new Date(curr.requestReceivedAt).getTime();
        }, 0);
      }
    }

    results = Object.values(results).sort((a, b) => {
      if (b.totalScore === a.totalScore) {
        return a.totalTime - b.totalTime;
      }
      return b.totalScore - a.totalScore;
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        head: problemListName,
        body: results
      }
    });
  },
  getProblemByLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { slug } = req.params;

    const problem = await ProblemModel.findOne({
      slug,
      isDeleted: false
    })
      .lean()
      .select("author class desc initCode level slug solution testTime timeStart title uuid alwayOpen testcases");

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    if (problem.author?._id !== _id) {
      throw new ForbiddenError("Forbidden!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problem
    });
  },
  getAllProblemByLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { search, class: classCurr, status, page = 1, limit = _PROCESS_ENV.PAGE_SIZE } = req.query;

    let problems = await ProblemModel.find({
      "author._id": _id,
      isDeleted: false
    })

      .lean()
      .select("title author class timeStart testTime timeEnd slug submitList")
      .sort({
        timeStart: -1
      });

    if (problems.length === 0) {
      return res.status(httpStatusCodes.OK).json({
        status: "success",
        data: [],
        currentPage: 1,
        totalPage: 0
      });
    }

    if (search?.trim()) problems = problems.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

    if (classCurr && classCurr !== "all") problems = problems.filter((p) => p.class?._id == classCurr);

    if (status && status !== "all") {
      const currentTime = new Date();
      switch (parseInt(status)) {
        case 1: {
          // upcoming
          problems = problems.filter((p) => new Date(p.timeStart) > currentTime);
          break;
        }
        case 2: {
          // now
          problems = problems.filter(
            (p) =>
              (new Date(p.timeStart) <= currentTime && new Date(p.timeEnd) >= currentTime) ||
              (!p.timeStart && !p.testTime)
          );
          break;
        }
        case 3: {
          // finished
          problems = problems.filter((p) => {
            const timeEnd = new Date(p.timeEnd);
            return timeEnd.getFullYear() != 1970 && timeEnd < currentTime;
          });
          break;
        }
      }
    }

    problems = problems.map((p) => {
      const { submitList, ...rest } = p;
      return {
        ...rest,
        done: submitList?.length || 0
      };
    });

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(problems.length / Number(limit));
    const currentPage = Number(page);
    problems = problems.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problems,
      currentPage,
      totalPage
    });
  },
  getAllProblemByAdmin: async (req, res) => {
    const { search, page = 1, limit = _PROCESS_ENV.PAGE_SIZE } = req.query;

    let problems = await ProblemModel.find().sort({ title: 1 }).select("-createdAt -updatedAt -__v").lean();

    if (search?.trim())
      problems = problems.filter(
        (p) => p._id?.toString() === search.trim() || p.author?._id.toString() === search.trim()
      );

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(problems.length / Number(limit));
    const currentPage = Number(page);
    problems = problems.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problems,
      currentPage,
      totalPage
    });
  },
  getResultByLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { id: problemId } = req.params;

    const problem = await ProblemModel.findOne({
      _id: problemId,
      isDeleted: false
    })
      .lean()
      .select("author");

    console.log(problem);

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    if (problem.author?._id !== _id) {
      throw new ForbiddenError("Forbidden!");
    }

    const _STUDENT_ROLE = "STUDENT";

    const data = await SubmissionModel.find({
      problem: problemId,
      requestReceivedAt: { $exists: true },
      "author.role": _STUDENT_ROLE
    })
      .sort({
        score: -1,
        requestReceivedAt: 1
      })
      .lean()
      .select("_id score requestReceivedAt author problem solution");

    if (data.length === 0) {
      return res.status(httpStatusCodes.OK).json({
        status: "success",
        data: []
      });
    }

    const authorSet = new Set();
    const results = data.filter((submission) => {
      if (!submission.author) {
        return false;
      }
      const authorId = submission.author._id;
      if (authorSet.has(authorId)) {
        return false;
      }
      authorSet.add(authorId);
      return true;
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: results
    });
  },
  getFolderInvalid: async (req, res) => {
    const folder = "problems";
    let problems = await ProblemModel.find().lean().select("uuid");
    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    problems = problems.map((p) => p.uuid);

    const { count, total } = await gRPCRequest.getCountFolderAsync(folder, problems, usersList);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        count,
        total
      }
    });
  },
  getProblemsWithoutAuthor: async (req, res) => {
    let problems = await ProblemModel.find();
    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    const total = problems.length;
    problems = problems.filter((p) => !usersList.includes(p.author?._id));
    const count = problems.length;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        count,
        total
      }
    });
  },
  softDelete: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const { slug } = req.params;

    const condition = { slug };

    if (role === "LECTURER") {
      condition.author = _id;
    }

    const problem = await ProblemModel.findOne(condition);

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    problem.isDeleted = !problem.isDeleted;
    await problem.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problem.isDeleted
    });
  },
  deleteProblemByAdmin: async (req, res) => {
    const { slug } = req.params;

    const problem = await ProblemModel.findOne({ slug });

    if (!problem) {
      throw new ConflictError("Problem not found!");
    }

    await SubmissionModel.deleteMany({ problem: problem._id });
    await problem.remove();

    return res.status(httpStatusCodes.NO_CONTENT).json();
  },
  deleteProblemWithoutAuthor: async (req, res) => {
    let problems = await ProblemModel.find();
    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    problems = problems.filter((p) => !usersList.includes(p.author?._id));

    for await (const problem of problems) {
      await ProblemModel.findByIdAndRemove(problem._id);
      await gRPCRequest.deleteSubmissionFolderByProblemUUIDAsync(problem.uuid);
      await gRPCRequest.deleteProblemFolderByUUIDAsync(problem.uuid);
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: problems.length
    });
  },
  clearFolderNoAuthorAndProblemUUID: async (req, res) => {
    const folder = "problems";
    let problems = await ProblemModel.find().lean().select("uuid");
    const { users } = await gRPCRequest.getUsersAvailableAsync();
    const usersList = JSON.parse(users).map((item) => item._id);

    problems = problems.map((p) => p.uuid);

    const length = await gRPCRequest.clearFolderAsync(folder, problems, usersList);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: length
    });
  }
};

export { ProblemService };
