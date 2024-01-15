// import environment variables from .env file
import dotenv from 'dotenv';
import os from 'os';
dotenv.config();

const MY_ENV = {
  PORT: process.env.PORT || 8080,
  THREAD_POOL_SIZE: os.cpus().length,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_DEV: process.env.MONGODB_DEV,
  MONGODB_PROD: process.env.MONGODB_PROD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  BOT_TELEGRAM_TOKEN: process.env.BOT_TELEGRAM_TOKEN,
  BOT_TELEGRAM_CHAT_ID: process.env.BOT_TELEGRAM_CHAT_ID,
};

export { MY_ENV };
