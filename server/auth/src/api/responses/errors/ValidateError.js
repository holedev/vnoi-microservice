import { httpStatusCodes } from "../httpStatusCodes/index.js";

class ValidateError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY;
    this.messageObject = message;
    Error.captureStackTrace(this);
  }
}

export { ValidateError };
