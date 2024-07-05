import { Schema, model } from "mongoose";

const Video = new Schema(
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
    interactives: {
      type: [],
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

const VideoModel = model("Video", Video);
export { VideoModel };
