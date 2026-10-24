import { TAX_RULES } from "@/lib/constants";
import { computeTaxes } from "@/lib/pricing";
import type { QuoteLine } from "@/lib/types";
import { getRoomCategory } from "@/content/room-board";
import { formatColomboDateTime, formatDuration, isSlotAligned, minutesBetween, nearestAlignedInput, toColomboInput } from "@/lib/prototype/time";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import type { PrototypeQuote } from "@/lib/prototype/types";

export type HourlyCost = {
  /** Hours after rounding up to the slot grid. */
  hours: number;
  fullDays: number;
  remainderHours: number;
  amount: number;
  capped: boolean;
};

function roundMinor(value: number): number {
  return Math.round(value);
}

/**
 * Module 09 pricing: one 24 h block price plus an hourly remainder, capped at
 * the 24 h rate. The same function is used by the UI, the request engine and
 * the check-out folio.
 */
export function hourlyRoomCost({
  durationMinutes,
  ratePer24h,
  ratePerHour,
  slotMinutes = PROTOTYPE_SETTINGS.stay.slotMinutes,
}: {
  durationMinutes: number;
  ratePer24h: number;
  ratePerHour: number;
  slotMinutes?: number;
}): HourlyCost {
  const slots = Math.ceil(Math.max(0, durationMinutes) / slotMinutes);
  const hours = (slots * slotMinutes) / 60;
  const fullDays = Math.floor(hours / 24);
  const remainderHours = hours - fullDays * 24;
  const remainder = Math.min(
    roundMinor(remainderHours * ratePerHour),
    ratePer24h,
  );
  return {
    hours,
    fullDays,
    remainderHours,
    amount: fullDays * ratePer24h + remainder,
    capped: remainderHours > 0 && remainderHours * ratePerHour > ratePer24h,
  };
}

export type WindowValidation =
  | {
      ok: true;
      startAt: string;
      endAt: string;
      startDate: Date;
      endDate: Date;
      durationMinutes: number;
    }
  | { ok: false; message: string; suggestion?: string };

export function validateWindow(
  interval: { startAt: string; endAt: string },
  now: Date | string = new Date(),
  options: {
    allowPast?: boolean;
    allowUnavailablePast?: boolean;
  } = {},
): WindowValidation {
  const start = new Date(interval.startAt);
  const end = new Date(interval.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, message: "Choose a valid start and end time." };
  }

  const { slotMinutes, minMinutes, maxMinutes, maxAdvanceDays } =
    PROTOTYPE_SETTINGS.stay;

  if (!isSlotAligned(start, slotMinutes)) {
    return {
      ok: false,
      message: `Start times are aligned to ${slotMinutes}-minute slots. Try ${nearestAlignedInput(
        toColomboInput(start),
        slotMinutes,
      ).replace("T", " at ")}.`,
      suggestion: nearestAlignedInput(toColomboInput(start), slotMinutes),
    };
  }
  if (!isSlotAligned(end, slotMinutes)) {
    return {
      ok: false,
      message: `End times are aligned to ${slotMinutes}-minute slots. Try ${nearestAlignedInput(
        toColomboInput(end),
        slotMinutes,
      ).replace("T", " at ")}.`,
      suggestion: nearestAlignedInput(toColomboInput(end), slotMinutes),
    };
  }

  const durationMinutes = minutesBetween(start, end);
  if (durationMinutes < 1) {
    return { ok: false, message: "The end time must be after the start time." };
  }
  if (durationMinutes < minMinutes) {
    return {
      ok: false,
      message: `The shortest stay is ${formatDuration(minMinutes)}.`,
    };
  }
  if (durationMinutes > maxMinutes) {
    return {
      ok: false,
      message: `The longest stay online is ${formatDuration(maxMinutes)}.`,
    };
  }

  if (!options.allowPast && start.getTime() < new Date(now).getTime()) {
    return { ok: false, message: "Choose a start time in the future." };
  }
  const advanceLimit = new Date(now).getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000;
  if (start.getTime() > advanceLimit) {
    return {
      ok: false,
      message: `Bookings open ${maxAdvanceDays} days ahead. Choose an earlier date.`,
    };
  }

  return {
    ok: true,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    startDate: start,
    endDate: end,
    durationMinutes,
  };
}

export function quoteInterval({
  startAt,
  endAt,
  roomNumber,
  now,
}: {
  startAt: string;
  endAt: string;
  roomNumber: string;
  now?: Date | string;
}): PrototypeQuote {
  const validation = validateWindow({ startAt, endAt }, now, {
    allowPast: true,
  });
  if (!validation.ok) throw new Error(validation.message);

  const category = getRoomCategory(roomNumber);
  if (!category) throw new Error("Choose a room from the board.");

  const pricing = PROTOTYPE_SETTINGS.pricing[category.id];
  const cost = hourlyRoomCost({
    durationMinutes: validation.durationMinutes,
    ratePer24h: pricing.ratePer24h,
    ratePerHour: pricing.ratePerHour,
  });

  const lines: QuoteLine[] = [];
  if (cost.fullDays > 0) {
    lines.push({
      type: "ROOM",
      description: `Room ${roomNumber} (${category.shortLabel}), ${cost.fullDays} × 24 h`,
      quantity: cost.fullDays,
      unitAmount: pricing.ratePer24h,
      amount: cost.fullDays * pricing.ratePer24h,
    });
  }
  if (cost.remainderHours > 0) {
    const amount = Math.min(
      roundMinor(cost.remainderHours * pricing.ratePerHour),
      pricing.ratePer24h,
    );
    lines.push({
      type: "ROOM",
      description: `Room ${roomNumber} (${category.shortLabel}), ${formatDuration(
        Math.round(cost.remainderHours * 60),
      )}${cost.capped ? " (capped at the 24 h rate)" : ""}`,
      quantity: 1,
      unitAmount: amount,
      amount,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const { taxLines, taxTotal } = computeTaxes(lines, TAX_RULES);
  const quotedAt = new Date().toISOString();

  return {
    startAt: validation.startAt,
    endAt: validation.endAt,
    durationMinutes: validation.durationMinutes,
    durationLabel: formatDuration(validation.durationMinutes),
    roomNumber,
    roomCategory: category.id,
    ratePer24h: pricing.ratePer24h,
    ratePerHour: pricing.ratePerHour,
    lines,
    subtotal,
    taxLines,
    taxTotal,
    total: subtotal + taxTotal,
    quotedAt,
  };
}

export function quoteSummaryLabel(startAt: string, endAt: string): string {
  return `${formatColomboDateTime(startAt)} to ${formatColomboDateTime(endAt)}`;
}
