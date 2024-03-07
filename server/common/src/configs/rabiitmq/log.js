import { sendLogTelegram } from "../../utils/telegram.js";
import { _ACTION, _PROCESS_ENV, _SERVICE } from "../env/index.js";
import { getChannel } from "./index.js";

/**
 * This function logs the given data and action, request is optional.
 * @param {Object} req The HTTP request object, if applicable.
 * @param {Object} data The data to be logged.
 * @param {String} action The action type for the log.
 * @returns {void}
 */

const logging = async (req, data, action) => {
  try {
    const channel = await getChannel();
    const dateOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      second: "2-digit"
    };
    const requestTime = new Date().toLocaleString("en-GB", dateOptions);

    if (!req) {
      channel.sendToQueue(
        _SERVICE.LOGGING_SERVICE.NAME,
        Buffer.from(
          JSON.stringify({
            action,
            data: {
              message: `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT}`,
              ...data,
              requestTime
            }
          })
        )
      );
      return;
    }
    const path = `${req.get("host")}${req.originalUrl}`;
    const IP = (req?.headers["x-forwarded-for"] || "").split(",").shift() || req.ip;
    const method = req.method;
    const requestId = req.headers["X-Request-Id"] || req.headers["x-request-id"] || "NO REQUEST-ID";
    const body = req.body;

    channel.sendToQueue(
      _SERVICE.LOGGING_SERVICE.NAME,
      Buffer.from(
        JSON.stringify({
          action,
          data: {
            message: `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT}`,
            ...data,
            path,
            IP,
            method,
            requestId,
            requestTime,
            body
          }
        })
      )
    );
  } catch (err) {
    sendLogTelegram("RABBITMQ::LOG\n" + err);
  }
};

/**
 * @param {Object} req The HTTP request, optional
 * @param {Object} data Data logger includes { requestId, requestTime, IP, method, path, message, body }
 * @returns {void}
 */

const logInfo = (req, data) => logging(req, data, _ACTION.LOGGING_INFO);

/**
 * @param {Object} req The HTTP request, optional
 * @param {Object} data Data logger includes { requestId, requestTime, IP, method, path, message, body, errStatus, errMessage, errStack }
 * @returns {void}
 */

const logError = (req, data) => logging(req, data, _ACTION.LOGGING_ERROR);

export { logInfo, logError };
