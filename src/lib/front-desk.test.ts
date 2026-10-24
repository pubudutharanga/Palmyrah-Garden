import { describe, expect, it } from "vitest";

import { verifyFrontDeskCredentials } from "./front-desk";

describe("verifyFrontDeskCredentials", () => {
  it("accepts the demo front desk credentials", () => {
    expect(verifyFrontDeskCredentials("admin", "2026")).toBe(true);
  });

  it("ignores surrounding whitespace in the username", () => {
    expect(verifyFrontDeskCredentials("  admin  ", "2026")).toBe(true);
  });

  it("rejects an incorrect username or password", () => {
    expect(verifyFrontDeskCredentials("admin", "2025")).toBe(false);
    expect(verifyFrontDeskCredentials("frontdesk", "2026")).toBe(false);
    expect(verifyFrontDeskCredentials("", "2026")).toBe(false);
  });
});
