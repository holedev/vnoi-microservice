import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import "express-async-errors";
import compression from "compression";
import helmet from "helmet";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { _PROXY_CONFIG } from "./src/configs/proxy/index.js";
import { VerifyToken } from "./src/api/middlewares/VerifyToken.js";
import { ErrorHandler } from "./src/api/middlewares/ErrorHandler.js";
import { apiFilter } from "./src/api/middlewares/apiFilter.js";
import { firebaseInit } from "./src/configs/firebase/index.js";
import { logInfo } from "./src/configs/rabiitmq/index.js";
import { RateLimit } from "./src/api/middlewares/RateLimit.js";

const app = express();
const PORT = _PROCESS_ENV.SERVICE_PORT;

firebaseInit();

const corsOptions = {
  origin: _PROCESS_ENV.NODE_ENV === "dev" ? "*" : _PROCESS_ENV.CLIENT_URL,
  credentials: true
};

app.use(RateLimit);

app.use(
  cors(corsOptions),
  helmet(),
  express.json(),
  express.urlencoded({ extended: true, limit: "20mb" }),
  compression()
);

app.use(VerifyToken);

app.use((req, res, next) => {
  logInfo(req, null);
  next();
});

app.use(apiFilter);

_PROXY_CONFIG.forEach(({ path, target }) => {
  app.use(
    path,
    proxy(target, {
      proxyErrorHandler: (err, res, next) => {
        next(err);
      }
    })
  );
});

app.use(ErrorHandler);

export { app, PORT };
