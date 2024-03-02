import { _ACTION } from "../../configs/env/index.js";
import { ProblemModel } from "../models/Problem.js";
import { InternalServerError } from "../responses/errors/InternalServerError.js";

const ExerciseService = {
  updateClass: async ({ _id, name }) => {
    try {
      await ProblemModel.updateMany({ "class._id": _id }, { $set: { "class.name": name } });
    } catch (err) {
      console.log(err);
    }
  },
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.CLASS_UPDATE:
        await ExerciseService.updateClass(data);
        return;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { ExerciseService };
