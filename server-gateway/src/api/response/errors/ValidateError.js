import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class ValidateError extends Error {
  constructor(message) {
    super();
    this.statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY;
    this.messageObject = message;
  }
}
