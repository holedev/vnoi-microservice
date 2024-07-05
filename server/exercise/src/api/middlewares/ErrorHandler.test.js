import { logError } from "../../configs/rabiitmq/log.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ErrorHandler } from "./ErrorHandler.js";

jest.mock("../../configs/rabiitmq/log.js");

describe("ErrorHandler", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: "GET",
      originalUrl: "/test"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should log error and respond with error details", () => {
    const err = {
      statusCode: httpStatusCodes.NOT_FOUND,
      message: "Resource not found",
      stack: "Error stack trace"
    };

    ErrorHandler(err, req, res, next);

    expect(logError).toHaveBeenCalledWith(req, {
      errStatus: err.statusCode,
      errMessage: err.message,
      errStack: err.stack
    });

    expect(res.status).toHaveBeenCalledWith(err.statusCode);
    expect(res.json).toHaveBeenCalledWith({
      status: err.statusCode,
      message: err.message,
      request: `${req.method} ${req.originalUrl}`
    });
  });

  it("Should handle error with default values", () => {
    const err = {};

    ErrorHandler(err, req, res, next);

    expect(logError).toHaveBeenCalledWith(req, {
      errStatus: httpStatusCodes.INTERNAL_SERVER_ERROR,
      errMessage: "ERROR DON'T HAVE A MESSAGE OR SERVER DIE!",
      errStack: "CANNOT GET ERR STACK! REQUEST CAN FROM RABBITMQ OR GRPC!"
    });

    expect(res.status).toHaveBeenCalledWith(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      status: httpStatusCodes.INTERNAL_SERVER_ERROR,
      message: "ERROR DON'T HAVE A MESSAGE OR SERVER DIE!",
      request: `${req.method} ${req.originalUrl}`
    });
  });

  it("Should handle error with messageObject", () => {
    const err = {
      messageObject: "Detailed error message"
    };

    ErrorHandler(err, req, res, next);

    expect(logError).toHaveBeenCalledWith(req, {
      errStatus: httpStatusCodes.INTERNAL_SERVER_ERROR,
      errMessage: err.messageObject,
      errStack: "CANNOT GET ERR STACK! REQUEST CAN FROM RABBITMQ OR GRPC!"
    });

    expect(res.status).toHaveBeenCalledWith(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      status: httpStatusCodes.INTERNAL_SERVER_ERROR,
      message: err.messageObject,
      request: `${req.method} ${req.originalUrl}`
    });
  });
});
