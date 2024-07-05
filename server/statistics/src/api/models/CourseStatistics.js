import { Schema, model } from "mongoose";

const CourseStatistic = new Schema(
  {
    user: {
      _id: String,
      email: String,
      fullName: String,
      role: String
    },
    course: {
      _id: String,
      title: String,
      lastModify: Date,
      progress: Number
    },
    lessonDoneList: {
      type: [String],
      default: []
    },
    questionDoneList: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const CourseStatisticModel = model("CourseStatistic", CourseStatistic);
export { CourseStatisticModel };
