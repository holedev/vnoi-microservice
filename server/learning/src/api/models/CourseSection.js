import { Schema, model } from "mongoose";
import slugify from "slugify";

const CourseSection = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String
    },
    lessons: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "CourseLesson"
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

CourseSection.pre("save", async function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, { lower: true });

    const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
    const docsWithSimilarSlug = await this.constructor.find({
      slug: slugRegex
    });

    if (docsWithSimilarSlug.length) {
      this.slug = `${this.slug}-${docsWithSimilarSlug.length}`;
    }
  }
  next();
});

const CourseSectionModel = model("CourseSection", CourseSection);
export { CourseSectionModel };
