import { Schema, model } from "mongoose";

const File = new Schema(
  {
    author: {
      _id: String,
      email: String,
      fullName: String,
      role: String
    },
    uuid: { type: String, required: true, unique: true },
    title: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
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

const FileModel = model("File", File);
export { FileModel };
