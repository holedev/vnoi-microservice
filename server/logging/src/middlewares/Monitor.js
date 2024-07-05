import client from "prom-client";

// Collect default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Define custom metrics
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

// Middleware function
const monitorMiddleware = (req, res) => {
  const end = requestDurationHistogram.startTimer();

  res.on("finish", () => {
    end();
    const route = req.url || "UNKNOWN_ROUTE";
    requestCounter.inc({ method: req.method, route });
  });

  res.on("close", () => {
    if (!res.finished) {
      end();
    }
  });
};

// Metrics endpoint function
const metricsEndpoint = async (req, res) => {
  res.writeHead(200, { "Content-Type": client.register.contentType });
  res.end(await client.register.metrics());
};

export { monitorMiddleware, metricsEndpoint };
