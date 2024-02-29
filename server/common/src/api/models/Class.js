import { Schema, model } from "mongoose";

const Class = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    totalStudent: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const ClassModel = model("Class", Class);
export { ClassModel };
