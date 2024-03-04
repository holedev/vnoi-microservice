import admin from "firebase-admin";
import uuidv4 from "uuid4";
import { UnauthorizeError } from "../responses/errors/UnauthorizeError.js";

const verifyToken = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.split("Bearer ")[1];

    if (!token) throw new UnauthorizeError("Unauthorized");

    const data = await admin.auth().verifyIdToken(token);

    req.headers["X-Request-Id"] = uuidv4();

    // login will ignore
    if (req.path === "/api/user/auth") return next();

    req.headers["X-User-Id"] = data._id;
    req.headers["X-User-Role"] = data.role;
    req.headers["X-User-Uid"] = data.uid;

    next();
  } catch (error) {
    throw new UnauthorizeError(error.message || "Unauthorized");
  }
};

export { verifyToken };
