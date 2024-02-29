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
  SERVICE_NAME: _SERVICE.EXERCISE_SERVICE.NAME,
  SERVICE_PORT: _SERVICE.EXERCISE_SERVICE.PORT,
  GRPC_CLIENT_PORT: _SERVICE.GRPC.CLIENT_PORT,
  GRPC_SERVER_PORT: _SERVICE.GRPC.SERVER_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  MONGODB_URL: process.env.MONGODB_URL,
  MAX_SUBMISSION: process.env.MAX_SUBMISSION
};

export { _PROCESS_ENV, _ACTION, _EXCHANGE, _SERVICE, _RESPONSE_SERVICE };
