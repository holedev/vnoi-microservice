import { Schema, model } from "mongoose";

const Question = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    answers: {
      type: [
        {
          value: {
            type: String,
            required: true
          },
          isCorrect: {
            type: Boolean,
            required: true
          }
        }
      ]
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const QuestionModel = model("Question", Question);
export { QuestionModel };
