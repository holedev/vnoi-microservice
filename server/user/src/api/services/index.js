import { _ACTION, _PROCESS_ENV } from "../../configs/env/index.js";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { gRPCRequest } from "./grpc.js";
import { publishMessage } from "../../configs/rabiitmq/index.js";

const _EMAIL_WHITE_LIST = ["phanleho002@gmail.com"];
const _DEFAULT_PASSWORD = "Admin@123";

function isAllowed(email) {
  if (_PROCESS_ENV.NODE_ENV === "dev") return true;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@ou\.edu\.vn$/;
  return _EMAIL_WHITE_LIST.includes(email) || emailPattern.test(email);
}

const UserService = {
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

    if (user.classCurr) {
      data.classCurr = user.classCurr;
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        ...data,
        isUpdate
      }
    });
  },
  getById: async (req, res) => {
    const { id } = req.params;
    const _id = req.headers["x-user-id"];

    if (id !== _id) {
      throw new ConflictError("Data conflict!");
    }

    const usr = await UserModel.findById(_id).lean();

    if (!usr) {
      throw new ConflictError("User not exist!");
    }

    const data = {
      _id: usr._id,
      email: usr.email,
      fullName: usr.fullName,
      role: usr.role,
      avatar: usr.avatar,
      studentCode: usr.studentCode,
      username: usr.username
    };

    if (usr.classCurr) {
      data.classCurr = usr.classCurr;
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: data
    });
  },
  update: async (req, res) => {
    try {
      const requestId = req.headers["x-request-id"];
      const _id = req.headers["x-user-id"];
      const { classCurr, fullName, studentCode } = req.body;

      const classCommon = await gRPCRequest.getClassByIdAsync(requestId, classCurr);

      const user = await UserModel.findByIdAndUpdate(
        _id,
        { classCurr: classCommon, fullName, studentCode },
        { new: true }
      );

      const payload = {
        requestId,
        action: _ACTION.USER_UPDATE,
        data: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      };
      publishMessage(payload);

      const data = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        studentCode: user.studentCode,
        username: user.username
      };

      if (user.classCurr) {
        data.classCurr = user.classCurr;
      }

      return res.status(httpStatusCodes.OK).json({
        status: "success",
        data: data
      });
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError("Student code already exists !!!");
      }
    }
  },
  getAllByAdmin: async (req, res) => {
    const { search, page = 1, limit = 9 } = req.query;

    let searchCriteria = {
      role: { $ne: "ADMIN" },
      isDeleted: { $in: [null, false] }
    };

    let users = await UserModel.find(searchCriteria)
      .sort()
      .select("_id email studentCode fullName classCurr role avatar")
      .lean();

    if (search?.trim()) {
      users = users.filter((u) => u._id.toString() === search.trim() || u.email.toString().includes(search.trim()));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(users.length / Number(limit));
    const currentPage = Number(page);
    users = users.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: users,
      totalPage,
      currentPage
    });
  },
  updateByAdmin: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const { id } = req.params;
    const { classCurr, fullName, studentCode, role } = req.body;

    const classCommon = await gRPCRequest.getClassByIdAsync(requestId, classCurr);

    const user = await UserModel.findByIdAndUpdate(
      id,
      { classCurr: classCommon, fullName, studentCode, role },
      { new: true }
    );

    const payload = {
      requestId,
      action: _ACTION.USER_UPDATE,
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    };
    publishMessage(payload);

    const { password, __v, createdAt, updatedAt, ...rest } = user.toObject();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: rest
    });
  },
  softDeleteByAdmin: async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(id, {
      isDeleted: true
    });

    if (!user) throw new ConflictError("User not found !!!");

    return res.status(httpStatusCodes.NO_CONTENT).json({
      status: "success",
      data: {}
    });
  },
  deleteByAdmin: async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) throw new ConflictError("User not found !!!");

    // delete submission of user
    // delete problem of user
    // delete class of user
    // delete user

    return res.status(httpStatusCodes.NO_CONTENT).json({
      status: "success",
      data: {}
    });
  },
  // handle rabbitmq event
  updateClass: async ({ _id, name }) => {
    try {
      await UserModel.updateMany({ "classCurr._id": _id }, { $set: { "classCurr.name": name } });
    } catch (err) {
      console.log(err);
    }
  },
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.CLASS_UPDATE:
        await UserService.updateClass(data);
        return;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { UserService };
