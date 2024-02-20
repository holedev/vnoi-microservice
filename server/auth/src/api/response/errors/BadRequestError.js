import { httpStatusCodes } from "../httpStatusCodes/index.js";

class BadRequestError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.BAD_REQUEST;
    this.messageObject = message;
  }
}

export { BadRequestError };
