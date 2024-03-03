import { ForbiddenError } from "../responses/errors/ForbiddenError.js";

const _LECTURER_ROLE = "LECTURER";
const _ADMIN_ROLE = "ADMIN";

const VerifyRole = {
  lecturer: (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role !== _LECTURER_ROLE) {
      throw new ForbiddenError("Forbidden!");
    }
    next();
  },
  admin: (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role !== _ADMIN_ROLE) {
      throw new ForbiddenError("Forbidden!");
    }
    next();
  },
  lecturerOrAdmin: (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role === _ADMIN_ROLE || role === _LECTURER_ROLE) {
      return next();
    }
    throw new ForbiddenError("Forbidden!");
  }
};

export { VerifyRole };
