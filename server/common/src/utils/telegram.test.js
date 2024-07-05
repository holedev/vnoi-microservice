import { _PROCESS_ENV } from "../configs/env/index.js";
import { sendLogTelegram } from "./telegram.js";

global.fetch = jest.fn();

describe("Telegram send log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should log error message in development environment", async () => {
    _PROCESS_ENV.NODE_ENV = "dev";
    console.log = jest.fn();

    await sendLogTelegram("Test error");

    expect(console.log).toHaveBeenCalledWith(
      `${_PROCESS_ENV.SERVICE_NAME}:${_PROCESS_ENV.SERVICE_PORT}\nTYPE: Test error`
    );
  });

  it("Should send message to Telegram in production environment", async () => {
    _PROCESS_ENV.NODE_ENV = "production";
    _PROCESS_ENV.BOT_TELEGRAM_TOKEN = "test-token";
    _PROCESS_ENV.BOT_TELEGRAM_CHAT_ID = "test-chat-id";

    const expectedBody = {
      chat_id: _PROCESS_ENV.BOT_TELEGRAM_CHAT_ID,
      text: `${_PROCESS_ENV.SERVICE_NAME}:${_PROCESS_ENV.SERVICE_PORT}\nTYPE: Test error`
    };

    fetch.mockImplementation(() => Promise.resolve({ status: 200 }));

    await sendLogTelegram("Test error");

    expect(fetch).toHaveBeenCalledWith(`https://api.telegram.org/bot${_PROCESS_ENV.BOT_TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(expectedBody)
    });
  });

  it("Should log error if fetch fails", async () => {
    _PROCESS_ENV.NODE_ENV = "production";
    _PROCESS_ENV.BOT_TELEGRAM_TOKEN = "test-token";
    _PROCESS_ENV.BOT_TELEGRAM_CHAT_ID = "test-chat-id";

    const expectedBody = {
      chat_id: _PROCESS_ENV.BOT_TELEGRAM_CHAT_ID,
      text: `${_PROCESS_ENV.SERVICE_NAME}:${_PROCESS_ENV.SERVICE_PORT}\nTYPE: Test error`
    };

    const fetchError = new Error("Fetch failed");

    fetch.mockImplementation(() => Promise.reject(fetchError));
    console.error = jest.fn();

    await sendLogTelegram("Test error");

    expect(fetch).toHaveBeenCalledWith(`https://api.telegram.org/bot${_PROCESS_ENV.BOT_TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(expectedBody)
    });

    expect(console.error).toHaveBeenCalledWith("Error sending Telegram message:", fetchError);
  });
});
