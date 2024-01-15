import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class InternalServerError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
    this.messageObject = message;
  }
}
