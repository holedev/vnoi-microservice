import { VerifyRole } from "./VerifyRole.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";

jest.mock("../responses/errors/ForbiddenError.js");

describe("VerifyRole", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("LECTURER", () => {
    it("Should call next when role is LECTURER", () => {
      req.headers["x-user-role"] = "LECTURER";

      VerifyRole.lecturer(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("Should throw 403 when role is not LECTURER", () => {
      req.headers["x-user-role"] = "STUDENT";

      expect(() => {
        VerifyRole.lecturer(req, res, next);
      }).toThrow(ForbiddenError);

      expect(ForbiddenError).toHaveBeenCalledWith("Forbidden!");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("ADMIN", () => {
    it("Should call next when role is ADMIN", () => {
      req.headers["x-user-role"] = "ADMIN";

      VerifyRole.admin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Should throw 403 when role is not ADMIN", () => {
      req.headers["x-user-role"] = "STUDENT";

      expect(() => {
        VerifyRole.admin(req, res, next);
      }).toThrow(ForbiddenError);

      expect(ForbiddenError).toHaveBeenCalledWith("Forbidden!");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("LECTURER_OR_ADMIN", () => {
    it("Should call next when role is LECTURER", () => {
      req.headers["x-user-role"] = "LECTURER";

      VerifyRole.lecturerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Should call next when role is ADMIN", () => {
      req.headers["x-user-role"] = "ADMIN";

      VerifyRole.lecturerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Should throw 403 when role is not LECTURER or ADMIN", () => {
      req.headers["x-user-role"] = "STUDENT";

      expect(() => {
        VerifyRole.lecturerOrAdmin(req, res, next);
      }).toThrow(ForbiddenError);

      expect(ForbiddenError).toHaveBeenCalledWith("Forbidden!");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
