import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class ForbiddenError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.FORBIDDEN;
    this.messageObject = message;
  }
}
