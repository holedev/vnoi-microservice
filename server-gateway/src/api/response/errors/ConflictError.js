import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class ConflictError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.CONFLICT;
    this.messageObject = message;
  }
}
