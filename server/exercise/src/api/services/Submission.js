const SubmissionService = {};

export { SubmissionService };

// async function getBestSubmisson(userId, problemId, withoutSubmissionId) {
//   const submissions = await SubmissionModel.find({
//     author: userId,
//     problem: problemId
//   }).lean();

//   let bestSubmission = null;

//   for (const submission of submissions) {
//     if (withoutSubmissionId) {
//       if (submission._id.toString() === withoutSubmissionId.toString()) {
//         continue;
//       }
//     }
//     if (!bestSubmission) {
//       bestSubmission = submission;
//     } else {
//       if (submission.score > bestSubmission.score) {
//         bestSubmission = submission;
//       } else if (submission.score === bestSubmission.score) {
//         if (new Date(submission.requestReceivedAt) < new Date(bestSubmission.requestReceivedAt)) {
//           bestSubmission = submission;
//         }
//       }
//     }
//   }

//   return bestSubmission;
// }

// async function deleteByAdmin(submission) {
//   const problem = await ProblemModel.findById(submission.problem);
//   if (problem && problem.submitList?.length > 0) {
//     let idx = 0;
//     for await (const si of problem.submitList) {
//       if (!si.userId || !submission.author) {
//         idx++;
//         continue;
//       }
//       if (si.userId.toString() === submission.author.toString()) {
//         si.submissionTotal -= 1;
//         if (si.submissionTotal <= 0) {
//           problem.submitList.splice(idx, 1);
//         } else {
//           const bestSubmission = await getBestSubmisson(submission.author, submission.problem, submission._id);
//           si.submissionId = bestSubmission._id;
//           si.maxScore = bestSubmission.score;
//         }
//       }
//       idx++;
//     }
//     await problem.save();
//   }
//   await submission.deleteOne();
//   await deleteSubmissionFolderByUUID(submission.uuid);
// }

// const SubmissionService = {
//   create: async (req, res) => {
//     const { problem, code } = req.body;
//     const { _id: user } = req.user;

//     const requestReceivedAt = new Date();
//     const uuid = uuidv4();

//     const problemDoc = await ProblemModel.findOne({
//       _id: problem,
//       isDeleted: false
//     }).populate({
//       path: "class",
//       select: "name"
//     });

//     if (!problemDoc) {
//       throw new NotFoundError("Problem not found!");
//     }

//     if (!problemDoc.alwayOpen) {
//       if (requestReceivedAt < new Date(problemDoc.timeStart) || requestReceivedAt > new Date(problemDoc.timeEnd)) {
//         throw new ConflictError("Problem is not available now!");
//       }
//     }

//     const userSubmission = problemDoc.submitList.find((s) => s.userId?.toString() === user);

//     if (userSubmission && userSubmission.submissionTotal >= MY_ENV.MAX_SUBMISSION) {
//       throw new BadRequestError(
//         `You have reached the maximum number of submissions (${MY_ENV.MAX_SUBMISSION}) for this problem!`
//       );
//     }

//     // const result = await handleSubmit(uuid, user, problem, code);

//     const worker = new Worker("./src/utils/workers/submit.js", {
//       workerData: {
//         uuid,
//         user,
//         problem,
//         code
//       }
//     });

//     if (isMainThread) {
//       worker.on("message", async (result) => {
//         const score = parseFloat((result.pass / result.total) * 10).toFixed(2);

//         const submission = await SubmissionModel.create({
//           author: new mongoose.Types.ObjectId(user),
//           problem: new mongoose.Types.ObjectId(problem._id),
//           solution: code,
//           pass: `${result.pass}/${result.total}`,
//           score,
//           uuid,
//           time: result.time,
//           requestReceivedAt
//         });

//         if (!submission) {
//           throw new ConflictError("Submit failed!");
//         }

//         if (userSubmission) {
//           userSubmission.submissionTotal += 1;
//           if (score > userSubmission.maxScore) {
//             userSubmission.maxScore = score;
//             userSubmission.submissionId = submission._id;
//           }
//         } else {
//           const obj = {
//             userId: user,
//             submissionId: submission._id,
//             submissionTotal: 1,
//             maxScore: score
//           };
//           problemDoc.submitList.push(obj);

//           if (problemDoc.class?.name === "OLYMPIC") {
//             await deleteKeysFromRedis([PROBLEM_COMPETITION]);
//           } else {
//             await deleteKeysFromRedis([PROBLEM_ALL]);
//           }
//         }

//         await problemDoc.save();

//         await deleteKeysFromRedis([`problems:${problemDoc.slug}`]);

//         const submitRemain = userSubmission
//           ? MY_ENV.MAX_SUBMISSION - userSubmission?.submissionTotal
//           : MY_ENV.MAX_SUBMISSION - 1;

//         const { createdAt, updatedAt, __v, author, problem: pb, uuid: u, ...rest } = submission._doc;

//         return res.status(httpStatusCodes.OK).json({
//           status: "success",
//           data: {
//             ...rest,
//             submitRemain
//           }
//         });
//       });

//       worker.on("error", (err) => {
//         return res.status(httpStatusCodes.BAD_REQUEST).json({
//           status: "error",
//           message: "Something went wrong!"
//         });
//       });
//     }
//   },
//   getSubmissionOfUser: async (req, res) => {
//     const { problem } = req.body;
//     const { _id: user } = req.user;
//     const submisions = await SubmissionModel.find({
//       problem,
//       author: user
//     })
//       .lean()
//       .sort({ requestReceivedAt: -1 })
//       .select("_id pass score solution time requestReceivedAt");

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       data: submisions
//     });
//   },
//   getAllSubmissionByAdmin: async (req, res) => {
//     const { search, page = 1, limit = MY_ENV.PAGE_SIZE } = req.query;

//     let submissions = await SubmissionModel.find()
//       .sort({
//         problem: 1
//       })
//       .select("-createdAt -updatedAt -__v")
//       .lean();

//     if (search?.trim())
//       submissions = submissions.filter(
//         (s) =>
//           s._id.toString() === search.trim() ||
//           s.author.toString() === search.trim() ||
//           s.problem.toString() === search.trim()
//       );

//     const skip = (Number(page) - 1) * Number(limit);
//     const totalPage = Math.ceil(submissions.length / Number(limit));
//     const currentPage = Number(page);
//     submissions = submissions.slice(skip, skip + Number(limit));

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       data: submissions,
//       currentPage,
//       totalPage
//     });
//   },
//   getSubmissionsWithoutAuthorWithoutProblem: async (req, res) => {
//     let submissions = await SubmissionModel.find().populate({ path: "author" }).populate({ path: "problem" }).lean();

//     const total = submissions.length;
//     submissions = submissions.filter((p) => !p.author || !p.problem);
//     const count = submissions.length;

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       data: {
//         count,
//         total
//       }
//     });
//   },
//   getFolderInvalid: async (req, res) => {
//     let submissions = await SubmissionModel.find().lean().select("uuid");
//     let users = await UserModel.find().lean().select("_id");

//     submissions = submissions.map((s) => s.uuid);
//     users = users.map((u) => u._id.toString());

//     const [count, total] = await countFolder("submissions", submissions, users);

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       data: {
//         count,
//         total
//       }
//     });
//   },
//   deleteSubmissionByAdmin: async (req, res) => {
//     const { id } = req.params;

//     const submission = await SubmissionModel.findById(id);

//     if (!submission) {
//       throw new ConflictError("Submission not found!");
//     }

//     await deleteByAdmin(submission);

//     return res.status(httpStatusCodes.NO_CONTENT).json({});
//   },
//   deleteSubmissionWithoutAuthorWithoutProblem: async (req, res) => {
//     let submissions = await SubmissionModel.find()
//       .populate({
//         path: "author"
//       })
//       .populate({
//         path: "problem"
//       });

//     submissions = submissions.filter((s) => !s.author || !s.problem);

//     for await (const submision of submissions) {
//       await deleteByAdmin(submision);
//     }

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       length: submissions.length
//     });
//   },
//   clearFolderNoAuthorAndSubmissionUUID: async (req, res) => {
//     let submissions = await SubmissionModel.find().lean().select("uuid");
//     let users = await UserModel.find().lean().select("_id");

//     submissions = submissions.map((s) => s.uuid);
//     users = users.map((u) => u._id.toString());

//     const length = await clearFolder("submissions", submissions, users);

//     return res.status(httpStatusCodes.OK).json({
//       status: "success",
//       length: length
//     });
//   }
// };
