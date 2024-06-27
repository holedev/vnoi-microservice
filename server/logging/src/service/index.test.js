import { LoggingService } from "./index";
import { logger } from "./winston";
import { sendLogTelegram } from "./telegram";

jest.mock("./winston", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock("./telegram", () => ({
  sendLogTelegram: jest.fn()
}));

describe("Logging Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loggerInfo", () => {
    it("Should call logger.info with the provided data", () => {
      const data = { message: "Test message", additionalData: "Additional data" };
      LoggingService.loggerInfo(data);
      expect(logger.info).toHaveBeenCalledWith(data);
    });
  });

  describe("loggerError", () => {
    it("Should call logger.error and sendLogTelegram with the error details", () => {
      const errorData = {
        message: "Error message",
        requestId: "request-123",
        requestTime: "2024-07-05T10:00:00Z",
        IP: "127.0.0.1",
        method: "POST",
        path: "/api/example",
        body: { key: "value" },
        errStatus: 500,
        errMessage: "Internal Server Error",
        errStack: "Stack trace goes here"
      };

      LoggingService.loggerError(errorData);

      expect(logger.error).toHaveBeenCalledWith({ message: "none", ...errorData });

      const expectedLogText =
        '500: 2024-07-05T10:00:00Z\nError message\nX-REQUEST-ID: request-123\nIP: 127.0.0.1\nREQUEST: POST /api/example\nBODY: {"key":"value"}\nERROR: Internal Server Error\nStack trace goes here';
      expect(sendLogTelegram).toHaveBeenCalledWith(expectedLogText);
    });
  });

  describe("handleEvent", () => {
    it("Should call loggerInfo when action is LOGGING_INFO", () => {
      const payload = { action: "logging_info", data: { message: "Info message" } };
      LoggingService.handleEvent(payload);
      expect(logger.info).toHaveBeenCalledWith(payload.data);
    });

    it("Should call loggerError and sendLogTelegram when action is LOGGING_ERROR", () => {
      const payload = {
        action: "logging_error",
        data: {
          message: "Error message",
          requestId: "request-123",
          requestTime: "2024-07-05T10:00:00Z",
          IP: "127.0.0.1",
          method: "POST",
          path: "/api/example",
          body: { key: "value" },
          errStatus: 500,
          errMessage: "Internal Server Error",
          errStack: "Stack trace goes here"
        }
      };

      LoggingService.handleEvent(payload);
      expect(logger.error).toHaveBeenCalledWith({ message: "none", ...payload.data });

      const expectedLogText =
        '500: 2024-07-05T10:00:00Z\nError message\nX-REQUEST-ID: request-123\nIP: 127.0.0.1\nREQUEST: POST /api/example\nBODY: {"key":"value"}\nERROR: Internal Server Error\nStack trace goes here';
      expect(sendLogTelegram).toHaveBeenCalledWith(expectedLogText);
    });

    it("Should log 'NO ACTION MATCH!' to console when action does not match", () => {
      const payload = { action: "_ACTION.UNKNOWN_ACTION", data: {} };
      const consoleSpy = jest.spyOn(console, "log");
      LoggingService.handleEvent(payload);
      expect(consoleSpy).toHaveBeenCalledWith("NO ACTION MATCH!");
    });
  });
});
