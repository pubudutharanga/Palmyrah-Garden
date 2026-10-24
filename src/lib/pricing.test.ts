import { describe, expect, it } from "vitest";

import {
  computeTaxes,
  quoteStay,
  resolveNightRate,
  type CatalogRoomType,
} from "@/lib/pricing";
import type { DateKey } from "@/lib/dates";
import type { NightRateOverride, QuoteLine } from "@/lib/types";

const dk = (value: string) => value as DateKey;

const deluxe: CatalogRoomType = {
  id: "deluxe-room",
  name: "Deluxe Room",
  baseRate: 2_450_000,
  maxAdults: 2,
  maxChildren: 2,
  maxOccupancy: 4,
};

const stay = {
  checkIn: dk("2026-12-14"),
  checkOut: dk("2026-12-16"),
  mealPlan: "BB" as const,
  rooms: [{ roomTypeId: "deluxe-room", adults: 2, children: 0 }],
};

describe("quoteStay", () => {
  it("matches the supplied two-night Deluxe BB vector", () => {
    const quote = quoteStay(stay, { roomTypes: [deluxe] });

    expect(quote.subtotal).toBe(5_900_000);
    expect(quote.taxLines.map((line) => [line.code, line.base, line.amount])).toEqual([
      ["SC", 5_900_000, 590_000],
      ["VAT", 6_490_000, 1_168_200],
    ]);
    expect(quote.taxTotal).toBe(1_758_200);
    expect(quote.total).toBe(7_658_200);
    expect(quote.depositDue).toBe(2_297_460);
    expect(quote.nights).toBe(2);
    expect(quote.lines.filter((line) => line.type === "ROOM")).toHaveLength(2);
    expect(quote.lines.filter((line) => line.type === "MEAL_PLAN")).toHaveLength(2);
  });

  it("applies a room discount to the pre-tax subtotal and tax base", () => {
    const quote = quoteStay(
      {
        ...stay,
        discount: { label: "10% room discount", kind: "percent", value: 10 },
      },
      { roomTypes: [deluxe] },
    );

    expect(quote.subtotal).toBe(5_410_000);
    expect(quote.taxLines.map((line) => line.amount)).toEqual([541_000, 1_071_180]);
    expect(quote.total).toBe(7_022_180);
  });

  it("adds no meal lines on room-only stays", () => {
    const quote = quoteStay({ ...stay, mealPlan: "RO" }, { roomTypes: [deluxe] });
    expect(quote.lines.every((line) => line.type === "ROOM")).toBe(true);
    expect(quote.subtotal).toBe(4_900_000);
  });
});

describe("computeTaxes", () => {
  const lines: QuoteLine[] = [
    {
      type: "ROOM",
      description: "Test room",
      quantity: 1,
      unitAmount: 1_000,
      amount: 1_000,
    },
  ];

  it("runs in order and compounds only where configured", () => {
    const result = computeTaxes(lines, [
      {
        code: "A",
        label: "First",
        percent: 10,
        appliesTo: ["ROOM"],
        compoundOn: [],
        order: 1,
      },
      {
        code: "B",
        label: "Second",
        percent: 20,
        appliesTo: ["ROOM"],
        compoundOn: ["A"],
        order: 2,
      },
    ]);

    expect(result.taxLines.map((line) => line.base)).toEqual([1_000, 1_100]);
    expect(result.taxLines.map((line) => line.amount)).toEqual([100, 220]);
    expect(result.taxTotal).toBe(320);
  });

  it("ignores disabled rules", () => {
    const result = computeTaxes(lines, [
      {
        code: "OFF",
        label: "Disabled",
        percent: 50,
        appliesTo: ["ROOM"],
        compoundOn: [],
        enabled: false,
        order: 1,
      },
    ]);
    expect(result.taxLines).toEqual([]);
    expect(result.taxTotal).toBe(0);
  });
});

describe("resolveNightRate", () => {
  const base = 100_000;

  it("never stacks overrides and prefers priority", () => {
    const overrides: NightRateOverride[] = [
      {
        id: "low",
        name: "Low priority",
        roomTypeIds: [],
        from: dk("2026-12-01"),
        to: dk("2026-12-31"),
        mode: "percent",
        value: 5000,
        priority: 1,
        enabled: true,
      },
      {
        id: "high",
        name: "High priority",
        roomTypeIds: ["deluxe-room"],
        from: dk("2026-12-01"),
        to: dk("2026-12-31"),
        mode: "percent",
        value: 1000,
        priority: 2,
        enabled: true,
      },
    ];

    const result = resolveNightRate(
      "deluxe-room",
      base,
      dk("2026-12-14"),
      overrides,
    );
    expect(result.rate).toBe(110_000);
    expect(result.overrideId).toBe("high");
  });

  it("prefers the narrowest range when priority ties", () => {
    const overrides: NightRateOverride[] = [
      {
        id: "wide",
        name: "Wide",
        roomTypeIds: [],
        from: dk("2026-12-01"),
        to: dk("2026-12-31"),
        mode: "fixed_delta",
        value: 10_000,
        priority: 5,
        enabled: true,
      },
      {
        id: "narrow",
        name: "Narrow",
        roomTypeIds: [],
        from: dk("2026-12-14"),
        to: dk("2026-12-16"),
        mode: "fixed_delta",
        value: 20_000,
        priority: 5,
        enabled: true,
      },
    ];

    expect(
      resolveNightRate("deluxe-room", base, dk("2026-12-14"), overrides).overrideId,
    ).toBe("narrow");
    expect(
      resolveNightRate("deluxe-room", base, dk("2026-12-20"), overrides).overrideId,
    ).toBe("wide");
  });

  it("supports weekday filters and clamps fixed deltas at zero", () => {
    const weekdays: NightRateOverride[] = [
      {
        id: "monday",
        name: "Monday",
        roomTypeIds: [],
        from: dk("2026-12-01"),
        to: dk("2026-12-31"),
        daysOfWeek: [1],
        mode: "fixed_delta",
        value: 20_000,
        priority: 1,
        enabled: true,
      },
    ];

    expect(
      resolveNightRate("deluxe-room", base, dk("2026-12-14"), weekdays).rate,
    ).toBe(120_000);
    expect(
      resolveNightRate("deluxe-room", base, dk("2026-12-15"), weekdays).rate,
    ).toBe(100_000);

    const negative: NightRateOverride[] = [
      { ...weekdays[0], id: "negative", daysOfWeek: undefined, value: -200_000 },
    ];
    expect(
      resolveNightRate("deluxe-room", base, dk("2026-12-14"), negative).rate,
    ).toBe(0);
  });
});
