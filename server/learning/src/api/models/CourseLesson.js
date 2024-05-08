import { Schema, model } from "mongoose";

const CourseLesson = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String
    },
    video: {
      type: {
        _id: String,
        title: String,
        path: String
      }
    },
    files: {
      type: [
        {
          _id: String,
          title: String,
          path: String
        }
      ]
    },
    content: {
      type: String
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

const CourseLessonModel = model("CourseLesson", CourseLesson);
export { CourseLessonModel };
