import "winston-daily-rotate-file";
import { _ACTION } from "../configs/env/index.js";
import { logger } from "./winston.js";
import { sendLogTelegram } from "./telegram.js";

const LoggingService = {
  loggerInfo: (data) => {
    // must have message key
    logger.info({ message: "none", ...data });
  },
  loggerError: (data) => {
    logger.error({ message: "none", ...data });

    const { message, requestId, requestTime, IP, method, path, body, errStatus, errMessage, errStack } = data;

    const errText = `${errStatus}: ${requestTime}\n${message}\nX-REQUEST-ID: ${requestId}\nIP: ${IP}\nREQUEST: ${method} ${path}\nBODY: ${JSON.stringify(body)}\nERROR: ${errMessage}\n${errStack}`;
    sendLogTelegram(errText);
  },
  handleEvent: async (payload) => {
    const { action, data } = payload;

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
