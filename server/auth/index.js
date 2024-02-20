import express from "express";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middleware/ErrorHandler.js";
import { createChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { AuthService } from "./src/api/auth/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await databaseConnection();

const channel = await createChannel();
subscribeMessage(channel, AuthService);

app.use(ErrorHandler);

export { app, PORT };
