import { _ACTION, _PROCESS_ENV } from "../../configs/env/index.js";
import { UserModel } from "../models/User.js";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { FormatData } from "../responses/formatData/index.js";



const AuthService = {
  
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
