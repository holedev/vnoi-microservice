import { httpStatusCodes } from "../httpStatusCodes/index.js";

class UnauthorizeError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.UNAUTHORIZED;
    this.messageObject = message;
    Error.captureStackTrace(this);
  }
}

export { UnauthorizeError };
