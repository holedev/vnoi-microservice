import { Schema, model } from "mongoose";

const ROLE_ENUM = ["STUDENT", "ADMIN", "LECTURER"];

const User = new Schema(
  {
    username: {
      type: String
      // required: true,
    },
    email: {
      type: String,
      require: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      min: 8
    },
    fullName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      default: "STUDENT"
    },
    studentCode: {
      type: String,
      length: 10,
      unique: true,
      default: function () {
        const _t = this;
        return _t.email.slice(0, 10);
      }
    },
    classCurr: {
      _id: { type: String },
      name: { type: String },
      totalStudent: { type: Number, default: 0 }
    },
    avatar: {
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

const UserModel = model("User", User);
export { UserModel };
