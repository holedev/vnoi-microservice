import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route"]
});

const requestDurationHistogram = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  buckets: [0.1, 0.5, 1, 2, 5]
});

const monitorMiddleware = (req, res, next) => {
  const end = requestDurationHistogram.startTimer();
  res.on("finish", () => {
    end();
    const route = req.route ? req.route.path : "UNKNOWN_ROUTE";
    requestCounter.inc({ method: req.method, route });
  });
  next();
};

const metricsEndpoint = async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};

export { monitorMiddleware, metricsEndpoint };
