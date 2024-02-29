import express from "express";
import "express-async-errors";
import cors from "cors";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { databaseConnection } from "./src/configs/database/index.js";
import { createChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { ProblemRoute } from "./src/api/routes/Problem.js";
import { SubmissionRoute } from "./src/api/routes/Submission.js";
import { grpcCompilerClient } from "./src/configs/grpc/index.js";
import { ExerciseService } from "./src/api/services/index.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

await databaseConnection();

await createChannel();
subscribeMessage(ExerciseService);

grpcCompilerClient.sayHello({ name: "demo" }, function (err, response) {
  console.log("Greeting:", response?.message);
});

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

app.use("/problems", ProblemRoute);
app.use("/submissions", SubmissionRoute);

app.use(ErrorHandler);

export { app, PORT };
