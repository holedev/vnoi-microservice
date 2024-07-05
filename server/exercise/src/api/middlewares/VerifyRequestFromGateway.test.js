import { VerifyRequestFromGateway } from "./VerifyRequestFromGateway.js";
import { InternalServerError } from "../responses/errors/InternalServerError.js";

jest.mock("../responses/errors/InternalServerError.js");

describe("VerifyRequestFromGateway", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should call next when x-request-id is present in headers", () => {
    req.headers["x-request-id"] = "12345";

    VerifyRequestFromGateway(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("Should throw InternalServerError when x-request-id is missing in headers", () => {
    expect(() => {
      VerifyRequestFromGateway(req, res, next);
    }).toThrow(InternalServerError);

    expect(InternalServerError).toHaveBeenCalledWith("Request ID is missing");
    expect(next).not.toHaveBeenCalled();
  });
});
