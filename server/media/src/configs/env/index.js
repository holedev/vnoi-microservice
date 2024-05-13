import dotenv from "dotenv";
import fs from "fs";

// name service message broker
const _SERVICE = JSON.parse(fs.readFileSync("../SERVICE.json"));

// action call message broker
const _ACTION = JSON.parse(fs.readFileSync("../ACTION.json"));

// exchange name message broker
const _EXCHANGE = JSON.parse(fs.readFileSync("../EXCHANGE.json"));

// response service message broker
const _RESPONSE_SERVICE = JSON.parse(fs.readFileSync("../RESPONSE.json"));

// gateway env
dotenv.config({
  path: ".env"
});

const _PROCESS_ENV = {
  NODE_ENV: process.env.NODE_ENV,
  SERVICE_NAME: _SERVICE.MEDIA_SERVICE.NAME,
  SERVICE_PORT: _SERVICE.MEDIA_SERVICE.PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  BOT_TELEGRAM_TOKEN: process.env.BOT_TELEGRAM_TOKEN,
  BOT_TELEGRAM_CHAT_ID: process.env.BOT_TELEGRAM_CHAT_ID,
  MONGODB_URL: process.env.MONGODB_URL,
  STATIC_FILE_URL: process.env.STATIC_FILE_URL
};

export { _PROCESS_ENV, _ACTION, _EXCHANGE, _SERVICE, _RESPONSE_SERVICE };
