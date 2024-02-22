import express from "express";
import "express-async-errors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { firebaseInit } from "./src/configs/firebase/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { RPCObserver, createChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { AuthService } from "./src/api/services/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

firebaseInit();
await databaseConnection();

const channel = await createChannel();
// subscribeMessage(channel, AuthService);
RPCObserver(_PROCESS_ENV.SERVICE_NAME, AuthService);

app.use(express.json(), express.urlencoded({ extended: true }));

app.post("/", AuthService.auth);

app.use(ErrorHandler);

export { app, PORT };
