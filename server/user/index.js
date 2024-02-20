import express from "express";
import "express-async-errors";
import { ErrorHandler } from "../common/src/middleware/ErrorHandler.js";
import UserRouter from "./src/api/routes/index.js";
import { sendErrorLog } from "../common/src/logging/index.js";

const app = express();

app.use(express.json());

app.use("/", UserRouter);

app.use(ErrorHandler);

app.listen(8020, () => {
  console.log("---> USER is running on port 8020 <---");
  sendErrorLog("USER is running on port 8020");
});
