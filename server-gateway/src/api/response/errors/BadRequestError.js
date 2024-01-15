import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class BadRequestError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.BAD_REQUEST;
    this.messageObject = message;
  }
}
