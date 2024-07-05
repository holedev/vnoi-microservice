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
    answersList: {
      type: [
        {
          _id: String,
          value: String,
          time: Date
        }
      ],
      default: []
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
