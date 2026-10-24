import { describe, expect, it } from "vitest";

import { formatLKR, fromMinor, pct, toMinor } from "@/lib/money";

describe("money", () => {
  it("converts LKR to integer minor units", () => {
    expect(toMinor(24_500)).toBe(2_450_000);
    expect(toMinor(0.01)).toBe(1);
    expect(fromMinor(2_450_000)).toBe(24_500);
  });

  it("rounds percentages half away from zero", () => {
    expect(pct(2_451_300, 2.5)).toBe(61_283);
    expect(pct(-2_451_300, 2.5)).toBe(-61_283);
    expect(pct(2_450_000, 10)).toBe(245_000);
    expect(pct(0, 18)).toBe(0);
  });

  it("formats LKR at the edge only", () => {
    expect(formatLKR(2_450_000)).toBe("LKR 24,500");
    expect(formatLKR(2_450_000, { decimals: true })).toBe("LKR 24,500.00");
    expect(formatLKR(-2_450_000)).toBe("−LKR 24,500");
  });
});
