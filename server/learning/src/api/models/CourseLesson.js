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
    videoId: {
      type: String
    },
    files: {
      type: [String]
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
