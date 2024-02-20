import admin from "firebase-admin";
import { UnauthorizeError } from "../../../../common/src/response/errors/UnauthorizeError.js";
import { ForbiddenError } from "../../../../common/src/response/errors/ForbiddenError.js";

const VerifyToken = {
  verify: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizeError("Unauthorized!");
    }

    const token = authHeader?.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      throw new UnauthorizeError("Unauthorized!");
    }
  },
  verifyAdminOrLecturer: async (req, res, next) => {
    await VerifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError("Unauthorized!");
      }

      if (user.role !== "ADMIN" && user.role !== "LECTURER") {
        throw new ForbiddenError("Forbidden!");
      }

      next();
    });
  },
  verifyAdmin: async (req, res, next) => {
    await VerifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError("Unauthorized!");
      }

      if (user.role !== "ADMIN") {
        throw new ForbiddenError("Forbidden!");
      }

      next();
    });
  },
  verifyLecturer: async (req, res, next) => {
    await VerifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError("Unauthorized!");
      }

      if (user.role !== "LECTURER") {
        throw new ForbiddenError("Forbidden!");
      }

      next();
    });
  }
};

export { VerifyToken };
