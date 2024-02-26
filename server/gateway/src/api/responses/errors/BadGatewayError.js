import { httpStatusCodes } from "../httpStatusCodes/index.js";

class BadGatewayError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.BAD_GATEWAY;
    this.messageObject = message;
    Error.captureStackTrace(this);
  }
}

export { BadGatewayError };
