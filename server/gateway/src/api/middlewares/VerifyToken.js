import { _ACTION, _SERVICE } from "../../configs/env/index.js";
import { requestAsync } from "../../configs/rabiitmq/index.js";
import { UnauthorizeError } from "../responses/errors/UnauthorizeError.js";

const verifyToken = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizeError("Unauthorized!");
  }

  const token = authHeader.split("Bearer ")[1];

  if (!token) {
    throw new UnauthorizeError("Unauthorized!");
  }

  console.log("OK");

  try {
    const payload = {
      action: _ACTION.VERIFY_USER,
      data: token
    };
    const data = await requestAsync(_SERVICE.AUTH_SERVICE, payload);
    if (!data) {
      throw new UnauthorizeError("Unauthorized!");
    }

    req.user = data;
    next();
  } catch (error) {
    throw new UnauthorizeError("Unauthorized!");
  }
};

export { verifyToken };
