import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { logInfo } from "./src/configs/rabiitmq/log.js";
import { VideoRoute } from "./src/api/routes/Video.js";
import { FileRoute } from "./src/api/routes/File.js";
import { ImageRoute } from "./src/api/routes/Image.js";
import { gRPCServerMedia } from "./src/configs/grpc/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

app.use("/videos", express.static("uploads/videos"));
app.use("/files", express.static("uploads/files"));
app.use("/images", express.static("uploads/images"));

app.use(cors({ origin: "*", credentials: true }), express.json(), express.urlencoded({ extended: true }));

await databaseConnection();

gRPCServerMedia();

// TODO: check request headers have x-request-id and x-user-id

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use("/videos", VideoRoute);
app.use("/files", FileRoute);
app.use("/images", ImageRoute);

app.use(ErrorHandler);

export { app, PORT };
