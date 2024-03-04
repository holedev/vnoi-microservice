import { format, createLogger, transports } from "winston";

const formatPrintInfo = format.printf(({ requestId, requestTime, IP, method, path, message, body }) => {
  return `${requestTime}::${requestId}::${message}::${IP}::${method} ${path}::${JSON.stringify(body)}`;
});

const formatPrintError = format.printf(
  ({ requestId, requestTime, IP, method, path, message, body, errStatus, errMessage, errStack }) => {
    return `${errStatus}::${requestTime}::${requestId}::${message}::${IP}::${method} ${path}::${JSON.stringify(body)}::${errMessage}::${errStack}`;
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

export { logger };
