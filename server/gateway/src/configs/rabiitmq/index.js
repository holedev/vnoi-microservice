import amqplib from "amqplib";
import { _ACTION, _PROCESS_ENV, _SERVICE } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

let amqplibConnection = null;
let channel = null;

const getConn = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  amqplibConnection.on("close", () => console.log("Connect close!"));
  return amqplibConnection;
};

const getChannel = async () => {
  try {
    const connection = await getConn();
    if (channel === null) {
      channel = await connection.createChannel();
    }
    channel.on("close", () => {
      console.log("Channel close");
    });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

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
    const requestId = req.headers["X-Request-Id"] || "NO REQUEST-ID";
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

const logInfo = (req, data) => logging(req, data, _ACTION.LOGGING_INFO);
const logError = (req, data) => logging(req, data, _ACTION.LOGGING_ERROR);

export { logInfo, logError };
