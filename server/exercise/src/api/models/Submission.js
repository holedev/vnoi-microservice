import { Schema, model } from "mongoose";

const Submission = new Schema(
  {
    author: {
      _id: String,
      email: String,
      fullName: String,
      role: String
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      require: true
    },
    uuid: {
      type: String,
      require: true
    },
    langIdSolution: {
      type: Number,
      require: true
    },
    solution: {
      type: String,
      require: true
    },
    pass: {
      type: String
    },
    score: {
      type: Number
    },
    timeAvg: {
      type: String
    },
    memoryAvg: {
      type: String
    },
    tokens: {
      type: [String],
      _id: false
    },
    requestReceivedAt: {
      type: Date,
      require: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

const SubmissionModel = model("Submission", Submission);
export { SubmissionModel };
