import { httpStatusCodes } from "../httpStatusCodes/index.js";

class ForbiddenError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.FORBIDDEN;
    this.messageObject = message;
    Error.captureStackTrace(this);
  }
}

export { ForbiddenError };
