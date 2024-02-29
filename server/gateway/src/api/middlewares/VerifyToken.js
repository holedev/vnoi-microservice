import admin from "firebase-admin";
import { _ACTION, _RESPONSE_SERVICE, _SERVICE } from "../../configs/env/index.js";
import { requestAsync } from "../../configs/rabiitmq/index.js";
import { UnauthorizeError } from "../responses/errors/UnauthorizeError.js";

const verifyToken = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.split("Bearer ")[1];

    if (!token) throw new UnauthorizeError("Unauthorized");

    const data = await admin.auth().verifyIdToken(token);

    // req.user = data;
    req.headers["X-User-Id"] = data._id;
    req.headers["X-User-Role"] = data.role;
    req.headers["X-User-Uid"] = data.uid;

    next();
  } catch (error) {
    throw new UnauthorizeError(error.message || "Unauthorized");
  }
};

export { verifyToken };
