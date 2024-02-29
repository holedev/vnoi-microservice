import { describe, it, expect } from "@jest/globals";
import { _PROCESS_ENV } from "./index.js";

describe("CHECK _PROCESS_ENV", () => {
  it("Should have NODE_ENV", () => {
    expect(_PROCESS_ENV.NODE_ENV).toBeDefined();
  });

  it("Should have SERVICE_INFO", () => {
    expect(_PROCESS_ENV.SERVICE_NAME).toBeDefined();
    expect(_PROCESS_ENV.SERVICE_PORT).toBeDefined();
  });

  it("Should have REDIS", () => {
    expect(_PROCESS_ENV.REDIS_HOST).toBeDefined();
    expect(_PROCESS_ENV.REDIS_PORT).toBeDefined();
  });

  it("Should have RABBITMQ", () => {
    expect(_PROCESS_ENV.RABBITMQ_URL).toBeDefined();
  });

  it("Should have MONGODB", () => {
    expect(_PROCESS_ENV.MONGODB_URL).toBeDefined();
  });
});
