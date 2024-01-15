import { httpStatusCodes } from '../httpStatusCodes/index.js';

export default class UnauthorizeError extends Error {
  constructor(message) {
    super();
    (this.statusCode = httpStatusCodes.UNAUTHORIZED),
      (this.messageObject = message);
  }
}
