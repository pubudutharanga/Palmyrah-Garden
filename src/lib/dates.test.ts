import { describe, expect, it } from "vitest";

import {
  addDays,
  diffNights,
  formatDateRange,
  formatDisplay,
  isDateKey,
  makeDateKey,
  nightsBetween,
  parseDateKey,
  rangesOverlap,
  toDateKey,
  todayKey,
  type DateKey,
} from "@/lib/dates";

const dk = (value: string) => value as DateKey;

describe("date keys", () => {
  it("round-trips real calendar dates", () => {
    const key = makeDateKey(2026, 12, 14);
    expect(key).toBe("2026-12-14");
    expect(isDateKey(key)).toBe(true);
    expect(parseDateKey(key).toISOString()).toBe("2026-12-14T00:00:00.000Z");
  });

  it("rejects impossible dates", () => {
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("14/12/2026")).toBe(false);
    expect(isDateKey(undefined)).toBe(false);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays(dk("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(dk("2028-02-28"), 1)).toBe("2028-02-29");
    expect(addDays(dk("2028-03-01"), -1)).toBe("2028-02-29");
  });

  it("counts half-open nights", () => {
    expect(diffNights(dk("2026-12-14"), dk("2026-12-16"))).toBe(2);
    expect(nightsBetween(dk("2026-12-14"), dk("2026-12-16"))).toEqual([
      "2026-12-14",
      "2026-12-15",
    ]);
  });

  it("treats adjacent stays as non-overlapping", () => {
    expect(
      rangesOverlap(dk("2026-12-14"), dk("2026-12-16"), dk("2026-12-16"), dk("2026-12-18")),
    ).toBe(false);
    expect(
      rangesOverlap(dk("2026-12-14"), dk("2026-12-16"), dk("2026-12-15"), dk("2026-12-17")),
    ).toBe(true);
  });

  it("resolves the resort day at Asia/Colombo midnight", () => {
    expect(toDateKey(new Date("2026-12-31T18:29:59Z"))).toBe("2026-12-31");
    expect(toDateKey(new Date("2026-12-31T18:30:00Z"))).toBe("2027-01-01");
    expect(todayKey(new Date("2026-12-31T18:30:00Z"))).toBe("2027-01-01");
  });

  it("formats without relying on the machine timezone", () => {
    const key = dk("2026-12-14");
    expect(formatDisplay(key)).toBe("14 Dec 2026");
    expect(formatDateRange(dk("2026-12-14"), dk("2026-12-16"))).toBe(
      "14 Dec – 16 Dec 2026",
    );
  });
});
