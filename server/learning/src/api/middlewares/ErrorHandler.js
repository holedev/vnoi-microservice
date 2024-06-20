import { logError } from "../../configs/rabiitmq/log.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";

export const ErrorHandler = (err, req, res, _next) => {
  const errStatus = err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR;
  const errMessage = err.messageObject || err.message || err || "ERROR DON'T HAVE A MESSAGE OR SERVER DIE!";
  const errStack = err.stack || "CANNOT GET ERR STACK! REQUEST CAN FROM RABBITMQ OR GRPC!";

  logError(req, {
    errStatus,
    errMessage,
    errStack
  });

  console.log(errMessage);
  console.log(errStack);

  const statusCode = errStatus;
  const messageError = errMessage;
  const error = {
    status: statusCode,
    message: messageError,
    request: `${req.method} ${req.originalUrl}`
  };

  return res.status(statusCode).json(error);
};
