import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { createChannel, publishMessage, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { CommonService } from "./src/api/services/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { ClassRoute } from "./src/api/routes/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await databaseConnection();

const channel = await createChannel();
// subscribeMessage(channel, CommonService);

app.use(
  cors({
    // client can access this service without gateway
    origin: "*",
    credentials: true
  })
);

app.use(express.json(), express.urlencoded({ extended: true }));

app.use("/classes", ClassRoute);

app.use(ErrorHandler);

export { app, PORT };
