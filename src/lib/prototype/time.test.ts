import { describe, expect, it } from "vitest";

import {
  buildColomboRange,
  colomboParts,
  formatDuration,
  fromColomboParts,
  isSlotAligned,
  parseColomboInput,
  toColomboInput,
} from "@/lib/prototype/time";

describe("Colombo time conversion", () => {
  it("converts a Colombo local input to UTC and back", () => {
    const parsed = parseColomboInput("2026-01-15T14:30");
    expect(parsed?.toISOString()).toBe("2026-01-15T09:00:00.000Z");
    expect(parsed && toColomboInput(parsed)).toBe("2026-01-15T14:30");
    expect(parsed && colomboParts(parsed)).toEqual({
      year: 2026,
      month: 1,
      day: 15,
      hour: 14,
      minute: 30,
    });
  });

  it("rejects malformed and non-existent local dates", () => {
    expect(parseColomboInput("2026-02-29T10:00")).toBeNull();
    expect(parseColomboInput("2024-02-29T10:00")).not.toBeNull();
    expect(parseColomboInput("2026-04-31T10:00")).toBeNull();
    expect(parseColomboInput("2026-01-15 14:30")).toBeNull();
    expect(parseColomboInput("2026-01-15T24:00")).toBeNull();
    expect(parseColomboInput("2026-01-15T14:60")).toBeNull();
  });

  it("does not read the host timezone", () => {
    const value = fromColomboParts(2026, 6, 1, 0, 0);
    expect(value.toISOString()).toBe("2026-05-31T18:30:00.000Z");
    expect(toColomboInput(value)).toBe("2026-06-01T00:00");
  });

  it("checks slot alignment against Colombo local minutes", () => {
    expect(isSlotAligned(fromColomboParts(2026, 1, 1, 10))).toBe(true);
    expect(isSlotAligned(fromColomboParts(2026, 1, 1, 10, 30))).toBe(false);
  });
});

describe("formatDuration", () => {
  it("formats minutes, hours and mixed durations", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(180)).toBe("3 h");
    expect(formatDuration(195)).toBe("3 h 15 min");
    expect(formatDuration(43_200)).toBe("720 h");
  });
});

describe("buildColomboRange", () => {
  it("builds annual, monthly and daily ranges in Colombo", () => {
    const year = buildColomboRange({ year: 2026 });
    expect(year.startAt).toBe("2025-12-31T18:30:00.000Z");
    expect(year.endAt).toBe("2026-12-31T18:30:00.000Z");

    const february = buildColomboRange({ year: 2026, month: 2 });
    expect(february.startAt).toBe("2026-01-31T18:30:00.000Z");
    expect(february.endAt).toBe("2026-02-28T18:30:00.000Z");

    const day = buildColomboRange({ year: 2026, month: 2, day: 14 });
    expect(day.startAt).toBe("2026-02-13T18:30:00.000Z");
    expect(day.endAt).toBe("2026-02-14T18:30:00.000Z");
  });

  it("keeps midnight-hour filters to a single hour", () => {
    const hour = buildColomboRange({ year: 2026, month: 1, day: 2, hour: 0 });
    expect(hour.startAt).toBe("2026-01-01T18:30:00.000Z");
    expect(hour.endAt).toBe("2026-01-01T19:30:00.000Z");
  });

  it("supports an explicit hour range, including 24:00", () => {
    const range = buildColomboRange({
      year: 2026,
      month: 1,
      day: 2,
      fromHour: 22,
      toHour: 24,
    });
    expect(range.startAt).toBe("2026-01-02T16:30:00.000Z");
    expect(range.endAt).toBe("2026-01-02T18:30:00.000Z");
  });

  it("validates leap days, month lengths and cascading filters", () => {
    expect(() =>
      buildColomboRange({ year: 2026, month: 2, day: 29 }),
    ).toThrow(/does not exist/);
    expect(() =>
      buildColomboRange({ year: 2024, month: 2, day: 29 }),
    ).not.toThrow();
    expect(() =>
      buildColomboRange({ year: 2026, month: 4, day: 31 }),
    ).toThrow(/does not exist/);
    expect(() => buildColomboRange({ year: 2026, day: 2 })).toThrow(/month/);
    expect(() =>
      buildColomboRange({ year: 2026, month: 1, hour: 10 }),
    ).toThrow(/day/);
    expect(() =>
      buildColomboRange({ year: 2026, month: 1, day: 2, fromHour: 12, toHour: 12 }),
    ).toThrow(/after/);
  });
});
