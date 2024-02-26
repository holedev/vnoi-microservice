import { _ACTION, _PROCESS_ENV } from "../../configs/env/index.js";
import { UserModel } from "../models/User.js";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { FormatData } from "../responses/formatData/index.js";

const _EMAIL_WHITE_LIST = ["phanleho002@gmail.com"];
const _DEFAULT_PASSWORD = "Admin@123";

function isAllowed(email) {
  if (_PROCESS_ENV.NODE_ENV === "dev") return true;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@ou\.edu\.vn$/;
  return _EMAIL_WHITE_LIST.includes(email) || emailPattern.test(email);
}

const AuthService = {
  auth: async (req, res) => {
    const { email, uid, avatar, fullName } = req.body;
    let isUpdate = false;

    if (!isAllowed(email)) throw new ForbiddenError("Please use email of OU !!!");

    let user = await UserModel.findOne({ email });

    if (user) {
      if (user.isDeleted) throw new ConflictError("User has blocked !!!");

      const userFirebase = await admin.auth().getUser(uid);
      const currentClaims = userFirebase.customClaims;

      if (
        !currentClaims ||
        currentClaims.role?.toString() !== user.role?.toString() ||
        currentClaims._id?.toString() !== user._id?.toString()
      ) {
        await admin.auth().setCustomUserClaims(uid, { role: user.role, _id: user._id });
        isUpdate = true;
      }

      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(_DEFAULT_PASSWORD, salt);

      user = await UserModel.create({
        email,
        username: email,
        password: hashed,
        avatar,
        fullName
      });
      await admin.auth().setCustomUserClaims(uid, { role: user.role, _id: user._id });
      isUpdate = true;
    }

    const data = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      studentCode: user.studentCode,
      username: user.username
    };

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        ...data,
        isUpdate
      }
    });
  },
  verify: async (token) => {
    try {
      const data = await admin.auth().verifyIdToken(token);
      return FormatData.success(data);
    } catch (error) {
      return FormatData.error(error.message || error);
    }
  },
  handleEvent: async (payload) => {
    payload = JSON.parse(payload);
    const { action, data } = payload;

    if (action === _ACTION.VERIFY_USER) {
      return await AuthService.verify(data);
    }
  }
};

export { AuthService };
