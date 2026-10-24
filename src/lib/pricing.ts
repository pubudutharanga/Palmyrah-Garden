import {
  DEPOSIT_PERCENT,
  MEAL_PLANS,
  TAX_RULES,
  type ChargeType,
  type MealPlan,
} from "@/lib/constants";
import { diffNights, formatDisplay, nightsBetween, type DateKey } from "@/lib/dates";
import { pct } from "@/lib/money";
import type {
  AppliedDiscount,
  NightRateOverride,
  Quote,
  QuoteInput,
  QuoteLine,
  TaxLine,
  TaxRule,
} from "@/lib/types";

export type CatalogRoomType = {
  id: string;
  name: string;
  baseRate: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
};

function dayOfWeek(key: DateKey): number {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function rangeLength(override: NightRateOverride): number {
  const from = Date.parse(`${override.from}T00:00:00Z`);
  const to = Date.parse(`${override.to}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000) + 1;
}

export function resolveNightRate(
  roomTypeId: string,
  baseRate: number,
  night: DateKey,
  overrides: NightRateOverride[] = [],
): { rate: number; overrideId?: string } {
  const candidates = overrides.filter((override) => {
    if (!override.enabled) return false;
    if (override.roomTypeIds.length > 0 && !override.roomTypeIds.includes(roomTypeId)) {
      return false;
    }
    if (night < override.from || night > override.to) return false;
    if (
      override.daysOfWeek &&
      override.daysOfWeek.length > 0 &&
      !override.daysOfWeek.includes(dayOfWeek(night))
    ) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) return { rate: baseRate };

  const winner = [...candidates].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const length = rangeLength(a) - rangeLength(b);
    if (length !== 0) return length;
    return a.id.localeCompare(b.id);
  })[0];

  let rate = baseRate;
  if (winner.mode === "percent") {
    rate = baseRate + pct(baseRate, winner.value / 100);
  } else if (winner.mode === "fixed_delta") {
    rate = baseRate + winner.value;
  } else {
    rate = winner.value;
  }

  return { rate: Math.max(0, rate), overrideId: winner.id };
}

export function computeTaxes(
  lines: QuoteLine[],
  taxRules: readonly TaxRule[] = TAX_RULES,
): { taxLines: TaxLine[]; taxTotal: number } {
  const taxLines: TaxLine[] = [];
  const ordered = [...taxRules]
    .filter((rule) => rule.enabled !== false)
    .sort((a, b) => a.order - b.order);

  for (const rule of ordered) {
    const lineBase = lines
      .filter((line) => rule.appliesTo.includes(line.type))
      .reduce((sum, line) => sum + line.amount, 0);
    const compoundBase = taxLines
      .filter((tax) => rule.compoundOn.includes(tax.code))
      .reduce((sum, tax) => sum + tax.amount, 0);
    const base = lineBase + compoundBase;
    const amount = pct(base, rule.percent);
    taxLines.push({
      code: rule.code,
      label: rule.label,
      percent: rule.percent,
      base,
      amount,
    });
  }

  return {
    taxLines,
    taxTotal: taxLines.reduce((sum, line) => sum + line.amount, 0),
  };
}

export function discountAmount(
  roomSubtotal: number,
  discount: AppliedDiscount,
): number {
  const raw =
    discount.kind === "percent"
      ? pct(roomSubtotal, discount.value)
      : discount.value;
  return Math.min(roomSubtotal, Math.max(0, raw));
}

export function quoteStay(
  input: QuoteInput,
  {
    roomTypes,
    overrides = [],
    taxRules = TAX_RULES,
    depositPercent = DEPOSIT_PERCENT,
    now = new Date(),
  }: {
    roomTypes: readonly CatalogRoomType[];
    overrides?: NightRateOverride[];
    taxRules?: readonly TaxRule[];
    depositPercent?: number;
    now?: Date;
  },
): Quote {
  const nights = diffNights(input.checkIn, input.checkOut);
  if (nights < 1) throw new Error("A stay needs at least one night.");
  if (input.rooms.length === 0) throw new Error("Choose at least one room.");

  const mealPlan: MealPlan = input.mealPlan ?? "RO";
  const typeById = new Map(roomTypes.map((type) => [type.id, type]));
  const lines: QuoteLine[] = [];
  const quoteRooms: Quote["rooms"] = [];
  let roomSubtotal = 0;

  for (const room of input.rooms) {
    const type = typeById.get(room.roomTypeId);
    if (!type) throw new Error("That room type is not available.");

    const roomNights = nightsBetween(input.checkIn, input.checkOut).map((night) => {
      const resolved = resolveNightRate(type.id, type.baseRate, night, overrides);
      return { night, rate: resolved.rate, overrideId: resolved.overrideId };
    });

    const subtotal = roomNights.reduce((sum, night) => sum + night.rate, 0);
    roomSubtotal += subtotal;

    quoteRooms.push({
      roomTypeId: type.id,
      roomId: room.roomId,
      name: type.name,
      adults: room.adults,
      children: room.children,
      nightly: roomNights,
      subtotal,
    });

    for (const night of roomNights) {
      lines.push({
        type: "ROOM",
        description: `${type.name}, ${formatDisplay(night.night)}`,
        quantity: 1,
        unitAmount: night.rate,
        amount: night.rate,
        night: night.night,
        roomTypeId: type.id,
        roomId: room.roomId,
      });
    }

    const plan = MEAL_PLANS[mealPlan];
    if (mealPlan !== "RO") {
      for (const night of roomNights) {
        const amount =
          room.adults * plan.adultPerNight + room.children * plan.childPerNight;
        if (amount > 0) {
          lines.push({
            type: "MEAL_PLAN",
            description: `${plan.label}, ${formatDisplay(night.night)}`,
            quantity: room.adults + room.children,
            unitAmount: room.adults > 0 ? plan.adultPerNight : plan.childPerNight,
            amount,
            night: night.night,
            roomTypeId: type.id,
            roomId: room.roomId,
          });
        }
      }
    }
  }

  if (input.discount) {
    const amount = discountAmount(roomSubtotal, input.discount);
    if (amount > 0) {
      lines.push({
        type: "DISCOUNT",
        description: input.discount.label,
        quantity: 1,
        unitAmount: -amount,
        amount: -amount,
      });
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const { taxLines, taxTotal } = computeTaxes(lines, taxRules);
  const total = subtotal + taxTotal;

  return {
    currency: "LKR",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    mealPlan,
    rooms: quoteRooms,
    lines,
    subtotal,
    taxLines,
    taxTotal,
    total,
    depositPercent,
    depositDue: pct(total, depositPercent),
    quotedAt: now.toISOString(),
  };
}

/** Type guard used by the tax engine tests. */
export function isChargeType(value: string): value is ChargeType {
  return value === "ROOM" || value === "MEAL_PLAN" || value === "DISCOUNT";
}
