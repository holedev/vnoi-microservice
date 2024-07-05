import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { ClassRoute } from "./src/api/routes/index.js";
import { gRPCServerCommon } from "./src/configs/grpc/index.js";
import { logInfo } from "./src/configs/rabiitmq/log.js";
import { VerifyRequestFromGateway } from "./src/api/middlewares/VerifyRequestFromGateway.js";
import { metricsEndpoint, monitorMiddleware } from "./src/api/middlewares/Monitor.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await databaseConnection();
await gRPCServerCommon();

app.use(monitorMiddleware);
app.get("/metrics", metricsEndpoint);

app.use(
  cors({
    // client can access this service without gateway
    origin: "*",
    credentials: true
  })
);

app.use(express.json(), express.urlencoded({ extended: true }));

app.use(VerifyRequestFromGateway);

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use("/classes", ClassRoute);

app.use(ErrorHandler);

export { app, PORT };
