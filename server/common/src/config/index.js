import dotenv from "dotenv";

// global env
// NOTE: dotenv path is from the ROOT of the project (common), not from the current file
dotenv.config({
  path: ".env"
});

const _PROCESS_ENV = {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_DEV: process.env.MONGODB_DEV,
  MONGODB_PROD: process.env.MONGODB_PROD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  BOT_TELEGRAM_TOKEN: process.env.BOT_TELEGRAM_TOKEN,
  BOT_TELEGRAM_CHAT_ID: process.env.BOT_TELEGRAM_CHAT_ID
};

export { _PROCESS_ENV };
