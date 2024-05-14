import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { logInfo } from "./src/configs/rabiitmq/log.js";
import { CourseRoute } from "./src/api/routes/Course.js";
import { VerifyRequestFromGateway } from "./src/api/middlewares/VerifyRequestFromGateway.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

app.use("/videos", express.static("uploads/videos"));
app.use("/files", express.static("uploads/files"));
app.use("/images", express.static("uploads/images"));

app.use(cors({ origin: "*", credentials: true }), express.json(), express.urlencoded({ extended: true }));

await databaseConnection();

app.use(VerifyRequestFromGateway);

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use("/courses", CourseRoute);

app.use(ErrorHandler);

export { app, PORT };
