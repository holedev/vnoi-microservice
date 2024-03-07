import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { getSubscribeChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { UserRoute } from "./src/api/routes/index.js";
import { firebaseInit } from "./src/configs/firebase/index.js";
import { UserService } from "./src/api/services/index.js";
import { gRPCServerUser } from "./src/configs/grpc/index.js";
import { logInfo } from "./src/configs/rabiitmq/log.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await firebaseInit();
await databaseConnection();

const channel = await getSubscribeChannel();
subscribeMessage(channel, UserService);

gRPCServerUser();

app.use(
  cors({
    // client can access this service without gateway
    origin: "*",
    credentials: true
  }),
  express.json(),
  express.urlencoded({ extended: true })
);

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use("/", UserRoute);

app.use(ErrorHandler);

export { app, PORT };
