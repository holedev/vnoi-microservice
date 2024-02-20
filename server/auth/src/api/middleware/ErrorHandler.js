import { _PROCESS_ENV } from "../../configs/env/index.js";
import { httpStatusCodes } from "../response/httpStatusCodes/index.js";

export const ErrorHandler = (err, req, res, next) => {
  const URL = `${req?.get("host")}${req.originalUrl}`;
  const IP = (req?.headers["x-forwarded-for"] || "").split(",").shift() || req?.ip;

  const errorLog = `${
    err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR
  }: ${new Date().toLocaleString()}\nIP: ${IP}\nREQUEST: ${
    req.method
  } ${URL}\nBODY: ${JSON.stringify(req.body)}\nERROR: ${err.message} ${err.stack}`;

  console.log(`----------------------------------------\n${errorLog}\n----------------------------------------`);

  // _PROCESS_ENV.NODE_ENV === "dev"
  //   ? console.log(`----------------------------------------\n${errorLog}\n----------------------------------------`)
  //   : sendErrorLog(errorLog);

  const messageError = err.messageObject || err.message || "Server not response!";
  const statusCode = err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR;
  const error = {
    status: statusCode,
    message: messageError,
    request: `${req.method} ${req.originalUrl}`
  };

  return res.status(statusCode).json(error);
};
