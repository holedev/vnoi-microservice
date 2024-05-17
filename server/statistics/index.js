import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { logInfo } from "./src/configs/rabiitmq/log.js";
import { VerifyRequestFromGateway } from "./src/api/middlewares/VerifyRequestFromGateway.js";
import { getSubscribeChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { StatisticsService } from "./src/api/services/index.js";
import { CourseRoute } from "./src/api/routes/Course.js";
import { gRPCServerStatistics } from "./src/configs/grpc/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

const channel = await getSubscribeChannel();
subscribeMessage(channel, StatisticsService);

gRPCServerStatistics();

app.use(
  cors({ origin: "*", credentials: true }),
  express.json(),
  express.urlencoded({ extended: true, limit: "50mb" })
);

await databaseConnection();

// app.use(VerifyRequestFromGateway);

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use("/courses", CourseRoute);

app.use(ErrorHandler);

export { app, PORT };
