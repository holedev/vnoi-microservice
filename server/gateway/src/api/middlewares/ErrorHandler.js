import { logError } from "../../configs/rabiitmq/index.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";

export const ErrorHandler = (err, req, res, next) => {

  logError(req, {
    errStatus: err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR,
    errMessage: err.messageObject || err.message || "Server not response!",
    errStack: err.stack
  });

  const messageError = err.messageObject || err.message || "Server not response!";
  const statusCode = err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR;
  const error = {
    status: statusCode,
    message: messageError,
    request: `${req.method} ${req.originalUrl}`
  };

  return res.status(statusCode).json(error);
};
