import { describe, it, expect, vi } from "vitest";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { firebaseConfig, app } from "../firebase";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn()
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn()
}));

describe("Firebase test", () => {
  it("Should firebase config defined", () => {
    expect(firebaseConfig).toBeDefined();
    expect(firebaseConfig).toHaveProperty("apiKey");
    expect(firebaseConfig).toHaveProperty("authDomain");
    expect(firebaseConfig).toHaveProperty("projectId");
    expect(firebaseConfig).toHaveProperty("storageBucket");
    expect(firebaseConfig).toHaveProperty("messagingSenderId");
    expect(firebaseConfig).toHaveProperty("appId");
    expect(firebaseConfig).toHaveProperty("measurementId");
    expect(firebaseConfig).toHaveProperty("databaseURL");
  });

  it("Should initializes Firebase app", () => {
    const expectValue = {};
    initializeApp.mockReturnValue(expectValue);

    const app = initializeApp(firebaseConfig);
    expect(initializeApp).toHaveBeenCalledWith(firebaseConfig);
    expect(app).toBe(expectValue);
  });

  it("Should initialized RealtimeDB", () => {
    const mockDatabase = {};
    getDatabase.mockReturnValue(mockDatabase);

    const database = getDatabase(app);
    expect(getDatabase).toHaveBeenCalledWith(app);
    expect(database).toBe(mockDatabase);
  });
});
