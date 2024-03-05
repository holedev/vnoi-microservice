import { _ACTION } from "../../configs/env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";
import { ProblemModel } from "../models/Problem.js";
import { SubmissionModel } from "../models/Submission.js";

const ExerciseService = {
  updateClass: async ({ _id, name }) => {
    try {
      await ProblemModel.updateMany({ "class._id": _id }, { $set: { "class.name": name } });
    } catch (err) {
      sendLogTelegram(`RABBITMQ::HANDLE\nERROR: ${err}`);
    }
  },
  updateUser: async ({ _id, email, fullName, role }) => {
    try {
      await ProblemModel.updateMany({ "author._id": _id }, { $set: { author: { _id, email, fullName, role } } });
      await SubmissionModel.updateMany({ "author._id": _id }, { $set: { author: { _id, email, fullName, role } } });
    } catch (err) {
      sendLogTelegram(`RABBITMQ::HANDLE\nERROR: ${err}`);
    }
  },
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.CLASS_UPDATE:
        await ExerciseService.updateClass(data);
        break;

      case _ACTION.USER_UPDATE:
        await ExerciseService.updateUser(data);
        break;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { ExerciseService };
