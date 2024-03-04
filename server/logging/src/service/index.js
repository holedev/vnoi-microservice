import { format, createLogger, transports } from "winston";
import "winston-daily-rotate-file";
import { _ACTION } from "../configs/env/index.js";

const formatPrintInfo = format.printf(({ requestId, requestTime, IP, method, path, message, body }) => {
  return `${requestTime}::${requestId}::${message}::${IP}::${method} ${path}::${JSON.stringify(body)}`;
});

const formatPrintError = format.printf(
  ({ requestId, requestTime, IP, method, path, message, status, body, errMessage }) => {
    return `${requestTime}::${requestId}::${message}::${IP}::${method} ${path}::${status}::${JSON.stringify(body)}::${errMessage}`;
  }
);

const logger = createLogger({
  format: format.combine(format.splat(), format.simple()),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: "src/logs",
      filename: "%DATE%.info.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "15d",
      format: formatPrintInfo,
      level: "info"
    }),
    new transports.DailyRotateFile({
      dirname: "src/logs",
      filename: "%DATE%.error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "15d",
      format: formatPrintError,
      level: "error"
    })
  ]
});

const LoggingService = {
  loggerInfo: (data) => {
    logger.info({ message: "none", ...data });
  },
  loggerError: (data) => {
    logger.error({ message: "none", ...data });
  },
  handleEvent: async (payload) => {
    const { action, data } = payload;
    console.log(action);

    switch (action) {
      case _ACTION.LOGGING_INFO:
        LoggingService.loggerInfo(data);
        return;

      case _ACTION.LOGGING_ERROR:
        LoggingService.loggerError(data);
        return;

      default:
        console.log("NO ACTION MATCH!");
    }
  }
};

export { LoggingService };
