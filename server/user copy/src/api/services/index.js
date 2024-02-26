import { _ACTION, _PROCESS_ENV } from "../../configs/env/index.js";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { FormatData } from "../responses/formatData/index.js";

const AuthService = {
  handleEvent: async (payload) => {
    payload = JSON.parse(payload);
    const { action, data } = payload;

    console.log(action, data);
  }
};

export { AuthService };
