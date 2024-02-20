import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import "express-async-errors";
import compression from "compression";
import helmet from "helmet";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { _PROXY_CONFIG } from "./src/configs/proxy/index.js";
import { morganMiddleware } from "../common/src/logging/index.js";

const app = express();

const corsOptions = {
  origin: _PROCESS_ENV.NODE_ENV === "dev" ? "*" : _PROCESS_ENV.CLIENT_URL,
  credentials: true
};

app.use(morganMiddleware);

app.use(
  cors(corsOptions),
  helmet(),
  express.json(),
  express.urlencoded({ extended: true, limit: "20mb" }),
  compression()
);

_PROXY_CONFIG.forEach(({ path, target }) => {
  app.use(
    path,
    proxy(target, {
      limit: "20mb"
    })
  );
});


const PORT = _PROCESS_ENV.PORT;

export { app, PORT };
