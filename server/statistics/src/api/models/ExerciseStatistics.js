import { Schema, model } from "mongoose";

const ExerciseStatistic = new Schema(
  {
    user: {
      _id: String,
      email: String,
      fullName: String,
      role: String
    },
    exerciseDoneList: [
      {
        _id: String,
        title: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const ExerciseStatisticModel = model("ExerciseStatistic", ExerciseStatistic);
export { ExerciseStatisticModel };
