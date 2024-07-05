import { InternalServerError } from "../responses/errors/InternalServerError.js";

const VerifyRequestFromGateway = (req, res, next) => {
  const requestId = req.headers["x-request-id"];
  if (!requestId) {
    throw new InternalServerError("Request ID is missing");
  }

  next();
};

export { VerifyRequestFromGateway };
