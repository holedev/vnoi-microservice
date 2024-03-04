import amqplib from "amqplib";
import { _ACTION, _PROCESS_ENV, _SERVICE } from "../env/index.js";

let amqplibConnection = null;

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
    const channel = await connection.createChannel();
    return channel;
  } catch (err) {
    console.log(err);
  }
};

const channel = await createChannel();

const logging = (req, data, action) => {
  try {
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
    const requestId = req.headers["X-Request-Id"];
    const body = req.body;

    console.log(req.headers);

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
    console.log(err);
  }
};

const logInfo = (req, data) => logging(req, data, _ACTION.LOGGING_INFO);
const logError = (req, data) => logging(req, data, _ACTION.LOGGING_ERROR);

export { createChannel, logInfo, logError };
