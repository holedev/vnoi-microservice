import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { createChannel } from "./src/configs/rabiitmq/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { ClassRoute } from "./src/api/routes/index.js";
import { gRPCServerCommon } from "./src/configs/grpc/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await databaseConnection();

await createChannel();

gRPCServerCommon();

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
