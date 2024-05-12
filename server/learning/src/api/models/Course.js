import { Schema, model } from "mongoose";
import slugify from "slugify";

const Course = new Schema(
  {
    authors: {
      type: [
        {
          _id: String,
          email: String,
          fullName: String,
          role: String
        }
      ]
    },
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String
    },
    desc: {
      type: String
    },
    coverPath: {
      type: String
    },
    sections: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "CourseSection"
          }
        }
      ]
    },
    publish: {
      classes: {
        type: [String]
      },
      time: Date
    },
    isDraft: {
      type: Boolean,
      default: true
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

Course.pre("save", async function (next) {
  if (this.isModified("title") || this.isNew) {
    const dynamicSlug = slugify(this.title, { lower: true });
    const escapedSlug = dynamicSlug.replace(/\+/g, "\\+");
    const slugRegex = new RegExp(`^(${escapedSlug})(-([0-9]*))?$`, "i");
    const docsWithSimilarSlug = await this.constructor.find({ slug: slugRegex });

    if (docsWithSimilarSlug.length) {
      this.slug = `${dynamicSlug}-${docsWithSimilarSlug.length}`;
    } else {
      this.slug = dynamicSlug;
    }
  }
  next();
});

const CourseModel = model("Course", Course);
export { CourseModel };
