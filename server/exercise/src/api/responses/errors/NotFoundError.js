import { httpStatusCodes } from "../httpStatusCodes/index.js";

class NotFoundError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.NOT_FOUND;
    this.messageObject = message;
    Error.captureStackTrace(this);
  }
}

export { NotFoundError };
