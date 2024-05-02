import { Schema, model } from "mongoose";
import slugify from "slugify";

const Problem = new Schema(
  {
    author: {
      _id: String,
      email: String,
      fullName: String,
      role: String
    },
    class: {
      _id: String,
      name: String
    },
    submitList: {
      type: [
        {
          _id: false,
          userId: { type: String },
          submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission"
          },
          maxScore: {
            type: Number
          },
          submissionTotal: {
            type: Number,
            default: 0
          }
        }
      ],
      default: []
    },
    title: {
      type: String,
      required: true
    },
    uuid: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      unique: true
    },
    timeStart: {
      type: Date
    },
    testTime: {
      type: Number
    },
    timeEnd: {
      type: Date
    },
    level: {
      type: Number,
      required: true
    },
    desc: {
      type: String
    },
    initCode: {
      type: String,
      required: true
    },
    langIdSolution: {
      type: Number,
      required: true
    },
    solution: {
      type: String,
      required: true
    },
    alwayOpen: {
      type: Boolean,
      default: false
    },
    testcases: {
      submissions: {
        type: [String],
        _id: false
      },
      input: String,
      output: String,
      generateCode: String,
      quantity: {
        type: Number,
        required: true
      },
      file: {
        type: Boolean,
        default: false,
        required: true
      }
    },
    timeLimit: Number,
    memoryLimit: Number,
    stackLimit: Number,
    availableLanguages: {
      type: [Number]
    },
    status: {
      type: String,
      enum: ["processing", "success", "error"],
      default: "processing"
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

Problem.pre("save", async function (next) {
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

  const validateTime = this.isModified("timeStart") || this.isModified("testTime") || this.isNew;
  if (validateTime) {
    const timeEnd = new Date(this.timeStart);
    timeEnd.setMinutes(timeEnd.getMinutes() + this.testTime);
    this.timeEnd = timeEnd;
  }
  next();
});

Problem.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  const validateTime = update.timeStart !== undefined || update.testTime !== undefined;

  if (validateTime && update.timeStart && update.testTime) {
    const timeEnd = new Date(update.timeStart);
    timeEnd.setMinutes(timeEnd.getMinutes() + update.testTime);
    update.timeEnd = timeEnd;
  }

  next();
});

const ProblemModel = model("Problem", Problem);
export { ProblemModel };
