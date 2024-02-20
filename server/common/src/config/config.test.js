import { describe, it, expect } from "@jest/globals";
import { _PROCESS_ENV } from "./index.js";

describe("CHECK _PROCESS_ENV", () => {
  it("Should have NODE_ENV", () => {
    expect(_PROCESS_ENV.NODE_ENV).toBeDefined();
  });

  it("Should have REDIS", () => {
    expect(_PROCESS_ENV.REDIS_HOST).toBeDefined();
    expect(_PROCESS_ENV.REDIS_PORT).toBeDefined();
  });

  it("Should have BOT_TELEGRAM", () => {
    expect(_PROCESS_ENV.BOT_TELEGRAM_TOKEN).toBeDefined();
    expect(_PROCESS_ENV.BOT_TELEGRAM_CHAT_ID).toBeDefined();
  });
});
