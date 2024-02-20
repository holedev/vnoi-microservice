import { describe, it, expect } from "@jest/globals";
import { sendErrorLog } from "./index.js";

describe("CHECK SEND ERROR LOG", () => {
  it("Should send log", async () => {
    const res = await sendErrorLog("Test log");
    expect(res).toBeUndefined();
  });
});
