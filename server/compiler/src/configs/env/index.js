import dotenv from "dotenv";
import fs from "fs";

// name service message broker
const _SERVICE = JSON.parse(fs.readFileSync("../SERVICE.json"));

// action call message broker
const _ACTION = JSON.parse(fs.readFileSync("../ACTION.json"));

// response service message broker
const _RESPONSE_SERVICE = JSON.parse(fs.readFileSync("../RESPONSE.json"));

// gateway env
dotenv.config({
  path: ".env"
});

const _PROCESS_ENV = {
  NODE_ENV: process.env.NODE_ENV,
  SERVICE_NAME: _SERVICE.COMPILER_SERVICE.NAME,
  SERVICE_PORT: _SERVICE.COMPILER_SERVICE.PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  BOT_TELEGRAM_TOKEN: process.env.BOT_TELEGRAM_TOKEN,
  BOT_TELEGRAM_CHAT_ID: process.env.BOT_TELEGRAM_CHAT_ID,
  DOCKER_LIMIT_TIME: process.env.DOCKER_LIMIT_TIME,
  DOCKER_LIMIT_MEMORY: process.env.DOCKER_LIMIT_MEMORY,
  GCC_IMAGE: process.env.GCC_IMAGE,
  STRING_SPLIT_TESTCASE: process.env.STRING_SPLIT_TESTCASE
};

export { _PROCESS_ENV, _ACTION, _SERVICE, _RESPONSE_SERVICE };
