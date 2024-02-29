import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { createChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { CompilerService } from "./src/api/services/index.js";
import { gRPCServerCompiler } from "./src/configs/grpc/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

// await databaseConnection();

const channel = await createChannel();
subscribeMessage(channel, CompilerService);

await gRPCServerCompiler();

app.use(
  cors({
    // client can access this service without gateway
    origin: "*",
    credentials: true
  })
);
app.use(express.json(), express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  console.log("Receive", req.path);
  next();
});

app.use(ErrorHandler);

export { app, PORT };
