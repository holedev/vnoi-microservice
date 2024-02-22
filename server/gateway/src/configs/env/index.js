import dotenv from "dotenv";
import fs from "fs";

// name service message broker
const _SERVICE = JSON.parse(fs.readFileSync("../SERVICE.json"));

// action call message broker
const _ACTION = JSON.parse(fs.readFileSync("../ACTION.json"));

// gateway env
dotenv.config({
  path: ".env"
});

const _PROCESS_ENV = {
  SERVICE_NAME: process.env.SERVICE_NAME || _SERVICE.GATEWAY_SERVICE,
  SERVICE_PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  RABBITMQ_EXCHANGE_NAME: process.env.RABBITMQ_EXCHANGE_NAME,
  CLIENT_URL: process.env.CLIENT_URL
};

export { _PROCESS_ENV, _ACTION, _SERVICE };
