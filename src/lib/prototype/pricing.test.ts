import { describe, expect, it } from "vitest";

import { TAX_RULES } from "@/lib/constants";
import {
  hourlyRoomCost,
  quoteInterval,
  validateWindow,
} from "@/lib/prototype/pricing";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import {
  addColomboDays,
  fromColomboParts,
} from "@/lib/prototype/time";

const { ratePer24h, ratePerHour } = PROTOTYPE_SETTINGS.pricing.non_ac;

function addHours(value: Date, hours: number): Date {
  return new Date(value.getTime() + hours * 60 * 60 * 1000);
}

describe("hourlyRoomCost", () => {
  it("charges the hourly remainder under a 24-hour block", () => {
    expect(
      hourlyRoomCost({
        durationMinutes: 180,
        ratePer24h,
        ratePerHour,
      }),
    ).toMatchObject({
      hours: 3,
      fullDays: 0,
      remainderHours: 3,
      amount: 750_000,
      capped: false,
    });
  });

  it("charges full 24-hour blocks and their remainder", () => {
    expect(
      hourlyRoomCost({ durationMinutes: 24 * 60, ratePer24h, ratePerHour }),
    ).toMatchObject({
      fullDays: 1,
      remainderHours: 0,
      amount: ratePer24h,
    });
    expect(
      hourlyRoomCost({ durationMinutes: 25 * 60, ratePer24h, ratePerHour }),
    ).toMatchObject({
      fullDays: 1,
      remainderHours: 1,
      amount: ratePer24h + ratePerHour,
    });
    expect(
      hourlyRoomCost({ durationMinutes: 48 * 60, ratePer24h, ratePerHour }),
    ).toMatchObject({
      fullDays: 2,
      remainderHours: 0,
      amount: ratePer24h * 2,
    });
  });

  it("caps a long remainder at one 24-hour rate", () => {
    const cost = hourlyRoomCost({
      durationMinutes: 23 * 60,
      ratePer24h,
      ratePerHour,
    });
    expect(cost.amount).toBe(ratePer24h);
    expect(cost.capped).toBe(true);
  });

  it("rounds partial slots up to the next hour", () => {
    expect(
      hourlyRoomCost({ durationMinutes: 61, ratePer24h, ratePerHour }),
    ).toMatchObject({ hours: 2, amount: ratePerHour * 2 });
  });
});

describe("validateWindow", () => {
  const now = fromColomboParts(2026, 1, 1, 10);

  it("accepts an aligned future window within the configured limits", () => {
    const result = validateWindow(
      {
        startAt: fromColomboParts(2026, 1, 2, 10).toISOString(),
        endAt: fromColomboParts(2026, 1, 2, 13).toISOString(),
      },
      now,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.durationMinutes).toBe(180);
  });

  it("rejects short, unaligned, past and too-distant windows", () => {
    const start = fromColomboParts(2026, 1, 2, 10);
    expect(
      validateWindow(
        { startAt: start.toISOString(), endAt: addHours(start, 2).toISOString() },
        now,
      ).ok,
    ).toBe(false);

    const unaligned = validateWindow(
      {
        startAt: fromColomboParts(2026, 1, 2, 10, 40).toISOString(),
        endAt: fromColomboParts(2026, 1, 2, 14).toISOString(),
      },
      now,
    );
    expect(unaligned.ok).toBe(false);
    if (!unaligned.ok) expect(unaligned.suggestion).toBe("2026-01-02T11:00");

    expect(
      validateWindow(
        {
          startAt: fromColomboParts(2026, 1, 1, 9).toISOString(),
          endAt: fromColomboParts(2026, 1, 1, 12).toISOString(),
        },
        now,
      ).ok,
    ).toBe(false);

    const tooFar = addColomboDays(
      fromColomboParts(2026, 1, 2, 10),
      PROTOTYPE_SETTINGS.stay.maxAdvanceDays + 1,
    );
    expect(
      validateWindow(
        { startAt: tooFar.toISOString(), endAt: addHours(tooFar, 3).toISOString() },
        now,
      ).ok,
    ).toBe(false);
  });

  it("rejects windows longer than 30 days", () => {
    const start = fromColomboParts(2026, 1, 2, 10);
    const end = addHours(start, 24 * 30 + 1);
    const result = validateWindow(
      { startAt: start.toISOString(), endAt: end.toISOString() },
      now,
    );
    expect(result.ok).toBe(false);
  });
});

describe("quoteInterval", () => {
  it("quotes a 3-hour stay with compounding service charge and VAT", () => {
    const quote = quoteInterval({
      startAt: fromColomboParts(2026, 2, 10, 10).toISOString(),
      endAt: fromColomboParts(2026, 2, 10, 13).toISOString(),
      roomNumber: "01",
      now: fromColomboParts(2026, 2, 9, 10),
    });

    expect(quote.durationMinutes).toBe(180);
    expect(quote.durationLabel).toBe("3 h");
    expect(quote.subtotal).toBe(750_000);
    expect(quote.lines).toHaveLength(1);
    expect(quote.taxLines.map((line) => line.code)).toEqual(["SC", "VAT"]);
    expect(quote.taxLines[0].amount).toBe(75_000);
    expect(quote.taxLines[1].base).toBe(825_000);
    expect(quote.taxLines[1].amount).toBe(148_500);
    expect(quote.total).toBe(973_500);
    expect(TAX_RULES[1].compoundOn).toEqual(["SC"]);
  });

  it("quotes a full day without an hourly line", () => {
    const quote = quoteInterval({
      startAt: fromColomboParts(2026, 2, 10, 10).toISOString(),
      endAt: fromColomboParts(2026, 2, 11, 10).toISOString(),
      roomNumber: "02",
      now: fromColomboParts(2026, 2, 9, 10),
    });
    expect(quote.lines).toHaveLength(1);
    expect(quote.lines[0].description).toContain("1 × 24 h");
    expect(quote.subtotal).toBe(ratePer24h);
    expect(quote.total).toBe(2_401_300);
  });

  it("prices an AC room with the AC rate and labels the category", () => {
    const quote = quoteInterval({
      startAt: fromColomboParts(2026, 2, 10, 10).toISOString(),
      endAt: fromColomboParts(2026, 2, 10, 13).toISOString(),
      roomNumber: "13",
      now: fromColomboParts(2026, 2, 9, 10),
    });

    const ac = PROTOTYPE_SETTINGS.pricing.ac;
    expect(quote.roomCategory).toBe("ac");
    expect(quote.subtotal).toBe(ac.ratePerHour * 3);

    const nonAcQuote = quoteInterval({
      startAt: fromColomboParts(2026, 2, 10, 10).toISOString(),
      endAt: fromColomboParts(2026, 2, 10, 13).toISOString(),
      roomNumber: "01",
      now: fromColomboParts(2026, 2, 9, 10),
    });
    expect(nonAcQuote.roomCategory).toBe("non_ac");
    expect(nonAcQuote.subtotal).toBe(750_000);
    expect(quote.subtotal).not.toBe(nonAcQuote.subtotal);
  });

  it("quotes a 24-hour AC stay at the AC 24-hour rate", () => {
    const quote = quoteInterval({
      startAt: fromColomboParts(2026, 2, 10, 10).toISOString(),
      endAt: fromColomboParts(2026, 2, 11, 10).toISOString(),
      roomNumber: "13",
      now: fromColomboParts(2026, 2, 9, 10),
    });
    const ac = PROTOTYPE_SETTINGS.pricing.ac;
    expect(quote.roomCategory).toBe("ac");
    expect(quote.subtotal).toBe(ac.ratePer24h);
    expect(quote.total).toBe(ac.ratePer24h * 1_298 / 1_000);
  });
});
