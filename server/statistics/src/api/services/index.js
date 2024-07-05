import { ConflictError } from "../responses/errors/ConflictError.js";
import { _ACTION } from "../../configs/env/index.js";
import { gRPCRequest } from "./gRPC.js";
import { ExerciseStatisticModel } from "../models/ExerciseStatistics.js";

const StatisticsService = {
  handleSubmissionCreate: async (data) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { requestId, userId, problem, submissionId } = data;

      if (!requestId || !userId || !problem) {
        throw new ConflictError("Not enough data!");
      }

      let exerciseStatistics = await ExerciseStatisticModel.findOne({ "user._id": userId });

      if (!exerciseStatistics) {
        const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, userId);
        exerciseStatistics = await ExerciseStatisticModel.create({
          user: userGRPC
        });
      }

      console.log(exerciseStatistics);

      exerciseStatistics.exerciseDoneList.push({
        _id: problem._id,
        title: problem.title
      });

      await exerciseStatistics.save();
    } catch (error) {
      console.log(error);
    }
  },

  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.SUBMISSION_CREATE:
        await StatisticsService.handleSubmissionCreate(data);
        return;

      case _ACTION.UPDATE_LESSON_DONE_LIST:
        // TODO: handle lesson done list update
        // await StatisticsService.handleLessonDoneListUpdate(data);
        return;

      default:
        throw new ConflictError("Action not found");
    }
  }
};

export { StatisticsService };
