import { _ACTION, _PROCESS_ENV, _RESPONSE_SERVICE, _SERVICE } from "../../configs/env/index.js";
import { ProblemModel } from "../models/Problem.js";
import { SubmissionModel } from "../models/Submission.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { FormatData } from "../responses/formatData/index.js";
import uuidv4 from "uuid4";
import { requestAsync } from "../../configs/rabiitmq/index.js";

const ProblemService = {
  create: async (req, res) => {
    const author = req.headers["x-user-id"];

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
        author,
        solutionCode,
        script
      }
    };

    const data = await requestAsync(_SERVICE.COMPILER_SERVICE.NAME, payload);

    if (data.code === _RESPONSE_SERVICE.ERROR) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        status: "error",
        message: data.message || "Something went wrong!"
      });
    }

    const dataCreate = {
      title,
      uuid,
      author: author,
      class: classCurr,
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

    // await createProblemFile(uuid, author, solutionCode, script);

    // const worker = new Worker("./src/utils/workers/create.js", {
    //   workerData: {
    //     uuid,
    //     author,
    //     solutionCode,
    //     script
    //   }
    // });

    // if (isMainThread) {
    //   worker.on("message", async (result) => {

    //   worker.on("error", (error) => {
    //
    //   });
    // }
  },
  // runTest: async (req, res) => {
  //   const { _id: user } = req.user;
  //   const { problem, code, testcases } = req.body;
  //   const uuid = uuidv4();

  //   // const results = await handleRunFile(uuid, user, problem, code, testcases);

  //   const worker = new Worker("./src/utils/workers/run.js", {
  //     workerData: {
  //       uuid,
  //       user,
  //       problem,
  //       code: handleCodeFromClient(code),
  //       testcases
  //     }
  //   });

  //   if (isMainThread) {
  //     worker.on("message", (message) => {
  //       return res.status(httpStatusCodes.OK).json({
  //         status: "success",
  //         data: message
  //       });
  //     });

  //     worker.on("error", (error) => {
  //       console.log(error);
  //       return res.status(httpStatusCodes.BAD_REQUEST).json({
  //         status: "error",
  //         message: error.messageObject || error.message || "Something went wrong!"
  //       });
  //     });
  //   }
  // },
  // updateProblemByLecturer: async (req, res) => {
  //   const { _id: author } = req.user;
  //   const { slug } = req.params;
  //   const {
  //     title,
  //     classCurr,
  //     timeStart = null,
  //     testTime = null,
  //     level,
  //     desc,
  //     initCode,
  //     solution,
  //     script,
  //     uuid,
  //     alwayOpen
  //   } = req.body;

  //   let solutionCode = solution.slice(3, -3);

  //   const worker = new Worker("./src/utils/workers/update.js", {
  //     workerData: {
  //       uuid,
  //       author,
  //       solutionCode,
  //       script
  //     }
  //   });

  //   if (isMainThread) {
  //     worker.on("message", async (result) => {
  //       const updateData = {
  //         title,
  //         author: new mongoose.Types.ObjectId(author),
  //         class: new mongoose.Types.ObjectId(classCurr),
  //         timeStart: alwayOpen ? null : timeStart,
  //         testTime: alwayOpen ? null : testTime,
  //         level,
  //         desc,
  //         initCode,
  //         solution,
  //         testcases: {
  //           generateCode: script.generateCode ? script.generateCode : null,
  //           quantity: parseInt(script.quantity),
  //           file: script.file
  //         },
  //         alwayOpen
  //       };

  //       const problem = await ProblemModel.findOneAndUpdate({ slug, isDeleted: false }, updateData, { new: true })
  //         .populate({
  //           path: "author",
  //           select: "_id role email"
  //         })
  //         .populate({
  //           path: "class",
  //           select: "_id name"
  //         })
  //         .select("-createdAt -updatedAt -__v -solution");

  //       await updateHash(`problems:${slug}`, problem._doc);
  //       await deleteKeysFromRedis([PROBLEM_ALL, PROBLEM_COMPETITION]);

  //       if (!problem) {
  //         throw new ConflictError("Problem not found!");
  //       }

  //       return res.status(httpStatusCodes.OK).json({
  //         status: "success",
  //         data: {}
  //       });
  //     });

  //     worker.on("error", (error) => {
  //       return res.status(httpStatusCodes.BAD_REQUEST).json({
  //         status: "error",
  //         message: error.messageObject || error.message || "Something went wrong!"
  //       });
  //     });
  //   }
  // },
  getBySlug: async (req, res) => {
    const user = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    const { slug } = req.params;

    let problem = await ProblemModel.findOne({
      slug,
      isDeleted: false
    })
      .populate({
        path: "author",
        select: "_id role email"
      })
      .populate({
        path: "class",
        select: "_id name"
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
        throw new ConflictError(`Problem is available from ${timeStart}!`);
        // throw new ConflictError(`Problem is available from ${handleDatetime(timeStart)}!`);
      }
    }

    const quantitySubmit = problem.submitList?.find((s) => s.userId?.toString() === user)?.submissionTotal;

    const submitRemain = Number(
      quantitySubmit ? _PROCESS_ENV.MAX_SUBMISSION - quantitySubmit : _PROCESS_ENV.MAX_SUBMISSION
    );

    const { submitList, ...rest } = problem;

    // const testcases = await getTestcaseFromFile(problem.uuid, problem.author?._id);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        problem: {
          ...rest,
          submitRemain
        }
        // testcases
      }
    });
  },
  getAllProblem: async (req, res) => {
    const user = req.headers["x-user-id"];
    const { search, class: classCurr, status, time, page = 1, limit = _PROCESS_ENV.PAGE_SIZE } = req.query;

    let problems = await ProblemModel.find({
      isDeleted: false
    })
      .populate({
        path: "author",
        select: "_id email"
      })
      .populate({
        path: "class",
        select: "_id name",
        match: {
          name: {
            $ne: "OLYMPIC"
          }
        }
      })
      .sort({
        timeStart: -1
      })
      .lean()
      .select("title author class timeStart testTime timeEnd level slug submitList");

    problems = problems.filter((p) => p.class);
    problems = problems.map((p) => {
      const isSubmit = !!p.submitList?.find((s) => s.userId?.toString() === user);
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
    const user = req.headers["x-user-id"];

    let data = await ProblemModel.find({
      isDeleted: false
    })
      .populate({
        path: "author",
        select: "_id role email"
      })
      .populate({
        path: "class",
        select: "_id name",
        match: {
          name: "OLYMPIC"
        }
      })
      .sort({
        timeStart: -1,
        title: 1
      })
      .lean()
      .select("_id title author class timeStart testTime timeEnd level slug submitList");
    data = data.filter((p) => p.class);
    data = data.map((p) => {
      const isSubmit = !!p.submitList?.find((s) => s.userId?.toString() === user);
      const score = p.submitList?.find((s) => s.userId?.toString() === user)?.maxScore;
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
      isDeleted: false
    })
      .populate({
        path: "class",
        select: " name",
        match: { name: "OLYMPIC" }
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

    problems = problems.filter((p) => p.class);

    const problemListName = problems.map((p) => p.title);

    let results = {};
    for (const p of problems) {
      const title = p.title;

      if (!p.submitList || p.submitList.length === 0) {
        continue;
      }

      for (const submission of p.submitList) {
        const userId = submission.userId?._id;
        if (!userId) {
          continue;
        }
        if (!results[userId]) {
          results[userId] = {
            user: {
              email: submission.userId.email,
              fullName: submission.userId.fullName
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
    const author = req.headers["x-user-id"];
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

    if (problem.author.toString() !== author) {
      throw new ForbiddenError("Forbidden!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: problem
    });
  },
  getAllProblemByLecturer: async (req, res) => {
    const { search, class: classCurr, status, page = 1, limit = _PROCESS_ENV.PAGE_SIZE } = req.query;
    const _id = req.headers["x-user-id"];

    let problems = await ProblemModel.find({
      author: _id,
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

    if (classCurr && classCurr !== "all") problems = problems.filter((p) => p.class == classCurr);

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
      problems = problems.filter((p) => p._id?.toString() === search.trim() || p.author?.toString() === search.trim());

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
  // getResultByLecturer: async (req, res) => {
  //   const { id: problemId } = req.params;
  //   const { _id: author } = req.user;

  //   const problem = await ProblemModel.findOne({
  //     _id: problemId,
  //     isDeleted: false
  //   })
  //     .lean()
  //     .select("author");

  //   if (!problem) {
  //     throw new ConflictError("Problem not found!");
  //   }

  //   if (problem?.author?.toString() !== author) {
  //     throw new ForbiddenError("Forbidden!");
  //   }

  //   const data = await SubmissionModel.find({
  //     problem: problemId,
  //     requestReceivedAt: { $exists: true }
  //   })
  //     .populate({
  //       path: "author",
  //       select: "_id role email fullName",
  //       match: {
  //         role: "STUDENT"
  //       }
  //     })
  //     .sort({
  //       score: -1,
  //       requestReceivedAt: 1
  //     })
  //     .lean()
  //     .select("_id score requestReceivedAt author problem solution");

  //   if (data.length === 0) {
  //     return res.status(httpStatusCodes.OK).json({
  //       status: "success",
  //       data: []
  //     });
  //   }

  //   const authorSet = new Set();
  //   const results = data.filter((submission) => {
  //     if (!submission.author) {
  //       return false;
  //     }
  //     const authorId = submission.author._id;
  //     if (authorSet.has(authorId)) {
  //       return false;
  //     }
  //     authorSet.add(authorId);
  //     return true;
  //   });

  //   return res.status(httpStatusCodes.OK).json({
  //     status: "success",
  //     data: results
  //   });
  // },
  // getFolderInvalid: async (req, res) => {
  //   let problems = await ProblemModel.find().lean().select("uuid");
  //   let users = await UserModel.find().lean().select("_id");

  //   problems = problems.map((p) => p.uuid);
  //   users = users.map((u) => u._id.toString());

  //   const [count, total] = await countFolder("problems", problems, users);

  //   return res.status(httpStatusCodes.OK).json({
  //     status: "success",
  //     data: {
  //       count,
  //       total
  //     }
  //   });
  // }
  // getProblemsWithoutAuthor: async (req, res) => {
  //   let problems = await ProblemModel.find().populate({
  //     path: "author"
  //   });

  //   const total = problems.length;
  //   problems = problems.filter((p) => !p.author);
  //   const count = problems.length;

  //   return res.status(httpStatusCodes.OK).json({
  //     status: "success",
  //     data: {
  //       count,
  //       total
  //     }
  //   });
  // },
  softDelete: async (req, res) => {
    const author = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const { slug } = req.params;

    const condition = { slug };

    if (role === "LECTURER") {
      condition.author = author;
    }

    const problem = await ProblemModel.findOne(condition).populate({
      path: "class",
      select: "name"
    });

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
    let problems = await ProblemModel.find().populate({
      path: "author"
    });

    problems = problems.filter((p) => !p.author);

    for await (const problem of problems) {
      await ProblemModel.findByIdAndRemove(problem._id);
      // await deleteSubmissionFolderByProblem(problem.uuid);
      // await deleteProblemFolderByUUID(problem.uuid);
      // await deleteKeysFromRedis(`problems:${problem.slug}`);
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      length: problems.length
    });
  }
  // clearFolderNoAuthorAndProblemUUID: async (req, res) => {
  //   let problems = await ProblemModel.find().lean().select("uuid");
  //   let users = await UserModel.find().lean().select("_id");

  //   problems = problems.map((p) => p.uuid);
  //   users = users.map((u) => u._id.toString());

  //   const length = await clearFolder("problems", problems, users);

  //   return res.status(httpStatusCodes.OK).json({
  //     status: "success",
  //     length: length
  //   });
  // },
  // handleEvent: async (payload) => {
  //   payload = JSON.parse(payload);
  //   const { action, data } = payload;

  //   console.log(action, data);
  // }
};

export { ProblemService };
