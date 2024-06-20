import { CourseStatisticModel } from "../models/CourseStatistics.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const CourseService = {
  updateLessonList: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const requestId = req.headers["x-request-id"];
    const { id } = req.params;
    const { courseId, status } = req.body;

    const condition = {
      "user._id": _id,
      "course._id": courseId
    };

    let statistic = await CourseStatisticModel.findOne(condition);

    const { jsonStr } = await gRPCRequest.getCourseByIdAsync(requestId, courseId);
    const courseGRPC = JSON.parse(jsonStr);

    if (!statistic) {
      const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, _id);

      statistic = await CourseStatisticModel.create({
        user: userGRPC,
        course: {
          _id: courseGRPC._id,
          title: courseGRPC.title,
          lastModify: courseGRPC.updatedAt,
          progress: 0
        }
      });
    }

    const isDone = statistic.lessonDoneList.find((lessonId) => lessonId == id);

    if (status && !isDone) {
      statistic.lessonDoneList.push(id);
    }

    if (!status && isDone) {
      statistic.lessonDoneList = statistic.lessonDoneList.filter((lessonId) => lessonId != id);
    }

    await statistic.save();

    return res.status(httpStatusCodes.OK).json({
      message: "success",
      data: {
        status
      }
    });
  }
};

export { CourseService };
