import admin from "firebase-admin";
import { VerifyToken } from "./VerifyToken";
import { UnauthorizeError } from "../responses/errors/UnauthorizeError.js";

jest.mock("firebase-admin", () => ({
  auth: () => ({
    verifyIdToken: jest.fn()
  })
}));

describe("VerifyToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: "GET",
      path: "/api/somepath",
      headers: {}
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should call next if method is OPTIONS", async () => {
    req.method = "OPTIONS";

    await VerifyToken(req, res, next);

    expect(admin.auth().verifyIdToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("Should throw UnauthorizeError if token is missing", async () => {
    req.headers.authorization = undefined;

    await expect(VerifyToken(req, res, next)).rejects.toThrow(UnauthorizeError);
    expect(admin.auth().verifyIdToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("Should throw UnauthorizeError if verifyIdToken throws an error", async () => {
    admin.auth().verifyIdToken.mockRejectedValue(new Error("Invalid token"));
    req.headers.authorization = "Bearer invalid_token";
    await expect(VerifyToken(req, res, next)).rejects.toThrow(UnauthorizeError);
  });

  it("Should call next if path is /api/user/auth", async () => {
    req.path = "/api/user/auth";
    req.headers.authorization = "Bearer valid_token";

    await VerifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
