import { rateLimit } from "express-rate-limit";
import { _PROCESS_ENV } from "../../configs/env/index.js";

const RateLimit = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  limit: _PROCESS_ENV.NODE_ENV === "dev" ? 1000 : 30, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  statusCode: 429,
  message: "Too many requests, please try again later."
});

export { RateLimit };
