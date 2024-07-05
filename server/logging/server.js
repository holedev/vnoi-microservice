import { metricsEndpoint, monitorMiddleware } from "./src/middlewares/Monitor.js";
import { getChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { LoggingService } from "./src/service/index.js";
import http from "http";

process.setMaxListeners(Infinity);

const channel = await getChannel();
subscribeMessage(channel, LoggingService);

const server = http.createServer((req, res) => {
  monitorMiddleware(req, res);

  if (req.url === "/metrics" && req.method === "GET") {
    return metricsEndpoint(req, res);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found!\n");
});

server.listen(_PROCESS_ENV.SERVICE_PORT, () => {
  console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | Running`);
});
