/**
 * Asia/Colombo interval helpers for the CR1 prototype.
 *
 * Sri Lanka has no daylight-saving changes, so a fixed +05:30 offset is exact.
 * Intervals are stored as ISO UTC instants; form values are local Colombo
 * `YYYY-MM-DDTHH:mm` strings. Nothing in this file reads the host timezone.
 */

export const COLOMBO_OFFSET_MS = 330 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const SLOT_MS = HOUR_MS;

export type ColomboParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type Interval = {
  startAt: string;
  endAt: string;
};

export type PeriodPreset = "now" | "tonight" | "tomorrow" | "custom";

export type Period = Interval & {
  preset: PeriodPreset;
  label: string;
  description: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const pad = (value: number) => String(value).padStart(2, "0");

function asDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function colomboParts(value: Date | string | number): ColomboParts {
  const shifted = new Date(asDate(value).getTime() + COLOMBO_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** `YYYY-MM-DDTHH:mm` in Colombo, suitable for a datetime-local input. */
export function toColomboInput(value: Date | string | number): string {
  const parts = colomboParts(value);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/**
 * Parse a Colombo local datetime input. Returns null for bad or overflowed
 * dates (for example 31 February).
 */
export function parseColomboInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number) as unknown as number[];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  const utc = Date.UTC(year, month - 1, day, hour, minute) - COLOMBO_OFFSET_MS;
  const date = new Date(utc);
  if (toColomboInput(date) !== value) return null;
  return date;
}

/** Build a UTC instant from Colombo calendar parts. */
export function fromColomboParts(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - COLOMBO_OFFSET_MS);
}

export function startOfColomboDay(value: Date | string | number): Date {
  const parts = colomboParts(value);
  return fromColomboParts(parts.year, parts.month, parts.day);
}

export function addColomboDays(value: Date | string | number, days: number): Date {
  return new Date(asDate(value).getTime() + days * 24 * HOUR_MS);
}

export function addMinutes(value: Date | string | number, minutes: number): Date {
  return new Date(asDate(value).getTime() + minutes * MINUTE_MS);
}

export function minutesBetween(startAt: Date | string, endAt: Date | string): number {
  return Math.max(0, Math.round((asDate(endAt).getTime() - asDate(startAt).getTime()) / MINUTE_MS));
}

export function isSlotAligned(value: Date | string, slotMinutes = 60): boolean {
  if (slotMinutes <= 0) return false;
  const localMs = asDate(value).getTime() + COLOMBO_OFFSET_MS;
  return localMs % (slotMinutes * MINUTE_MS) === 0;
}

/** Round a Colombo local time down to the previous slot boundary. */
export function alignDown(value: Date | string | number, slotMinutes = 60): Date {
  const slotMs = slotMinutes * MINUTE_MS;
  const localMs = asDate(value).getTime() + COLOMBO_OFFSET_MS;
  return new Date(Math.floor(localMs / slotMs) * slotMs - COLOMBO_OFFSET_MS);
}

/** Round a Colombo local time up to the next slot boundary. */
export function alignUp(value: Date | string | number, slotMinutes = 60): Date {
  const slotMs = slotMinutes * MINUTE_MS;
  const localMs = asDate(value).getTime() + COLOMBO_OFFSET_MS;
  return new Date(Math.ceil(localMs / slotMs) * slotMs - COLOMBO_OFFSET_MS);
}

/** Nearest aligned input string, used to make validation messages actionable. */
export function nearestAlignedInput(value: string, slotMinutes = 60): string {
  const parsed = parseColomboInput(value);
  if (!parsed) return toColomboInput(alignUp(new Date(), slotMinutes));
  const down = alignDown(parsed, slotMinutes);
  const up = alignUp(parsed, slotMinutes);
  const nearest =
    Math.abs(parsed.getTime() - down.getTime()) <= Math.abs(up.getTime() - parsed.getTime())
      ? down
      : up;
  return toColomboInput(nearest);
}

export function formatColomboTime(value: Date | string | number): string {
  const parts = colomboParts(value);
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatColomboDate(
  value: Date | string | number,
  options: { year?: boolean; weekday?: boolean } = {},
): string {
  const parts = colomboParts(value);
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const prefix = options.weekday ? `${WEEKDAYS[date.getUTCDay()]} ` : "";
  return `${prefix}${parts.day} ${MONTHS[parts.month - 1]}${
    options.year === false ? "" : ` ${parts.year}`
  }`;
}

export function formatColomboDateTime(
  value: Date | string | number,
  options: { year?: boolean } = {},
): string {
  return `${formatColomboDate(value, { year: options.year })} at ${formatColomboTime(value)}`;
}

export function formatColomboRange(
  startAt: Date | string,
  endAt: Date | string,
  options: { year?: boolean; compact?: boolean } = {},
): string {
  const year = options.year ?? true;
  if (options.compact) {
    return `${formatColomboDate(startAt, { year })} ${formatColomboTime(startAt)} to ${formatColomboDate(endAt, { year })} ${formatColomboTime(endAt)}`;
  }
  return `${formatColomboDateTime(startAt, { year })} to ${formatColomboDateTime(endAt, { year })}`;
}

export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

export function formatMinutesOfDay(hour: number, minute = 0): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function periodFromDates(
  startAt: Date,
  endAt: Date,
  preset: PeriodPreset = "custom",
): Period {
  const label =
    preset === "now"
      ? "Next 24 hours"
      : preset === "tonight"
        ? "Tonight"
        : preset === "tomorrow"
          ? "Tomorrow"
          : "Custom window";
  return {
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    preset,
    label,
    description: formatColomboRange(startAt, endAt, { compact: true }),
  };
}

export function presetsFor(nowValue: Date | string, slotMinutes = 60): Record<"now" | "tonight" | "tomorrow", Period> {
  const now = asDate(nowValue);
  const today = startOfColomboDay(now);

  const nowStart = alignUp(now, slotMinutes);
  const nowPeriod = periodFromDates(
    nowStart,
    addMinutes(nowStart, 24 * 60),
    "now",
  );

  const tonightStart = addMinutes(today, 19 * 60);
  const tonightEnd = addMinutes(today, 32 * 60);
  const nightStart = now >= tonightEnd ? addMinutes(tonightStart, 24 * 60) : tonightStart;
  const nightEnd = addMinutes(nightStart, 13 * 60);
  const tonightPeriod = periodFromDates(
    alignUp(nightStart, slotMinutes),
    alignUp(nightEnd, slotMinutes),
    "tonight",
  );

  const tomorrowStart = addMinutes(addColomboDays(today, 1), 14 * 60);
  const tomorrowEnd = addMinutes(addColomboDays(today, 2), 12 * 60);
  const tomorrowPeriod = periodFromDates(
    tomorrowStart,
    tomorrowEnd,
    "tomorrow",
  );

  return { now: nowPeriod, tonight: tonightPeriod, tomorrow: tomorrowPeriod };
}

export type HistoryRangeInput = {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  fromHour?: number;
  toHour?: number;
};

/**
 * Cascading history range. Year alone covers the year; adding month covers the
 * month; adding day covers the day; adding hour covers that local hour. The
 * returned end is exclusive, suitable for overlap filters.
 */
export function buildColomboRange(input: HistoryRangeInput): Interval {
  if (
    !Number.isInteger(input.year) ||
    input.year < 2000 ||
    input.year > 2100 ||
    (input.month !== undefined &&
      (!Number.isInteger(input.month) || input.month < 1 || input.month > 12)) ||
    (input.day !== undefined &&
      (!Number.isInteger(input.day) || input.day < 1 || input.day > 31)) ||
    (input.hour !== undefined &&
      (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23))
  ) {
    throw new Error("Invalid history range.");
  }

  if ((input.day !== undefined || input.hour !== undefined) && input.month === undefined) {
    throw new Error("Choose a month before choosing a day.");
  }
  if (input.hour !== undefined && input.day === undefined) {
    throw new Error("Choose a day before choosing an hour.");
  }
  if (input.month !== undefined && input.day !== undefined) {
    const lastDay = new Date(Date.UTC(input.year, input.month, 0)).getUTCDate();
    if (input.day > lastDay) throw new Error("That day does not exist in this month.");
  }
  if (input.fromHour !== undefined || input.toHour !== undefined) {
    if (input.day === undefined) throw new Error("Choose a day before choosing an hour range.");
    if (
      (input.fromHour !== undefined &&
        (!Number.isInteger(input.fromHour) ||
          input.fromHour < 0 ||
          input.fromHour > 23)) ||
      (input.toHour !== undefined &&
        (!Number.isInteger(input.toHour) || input.toHour < 1 || input.toHour > 24))
    ) {
      throw new Error("Invalid hour range.");
    }
    if (
      input.fromHour !== undefined &&
      input.toHour !== undefined &&
      input.fromHour >= input.toHour
    ) {
      throw new Error("The end hour must be after the start hour.");
    }
  }
  if (input.hour !== undefined && (input.fromHour !== undefined || input.toHour !== undefined)) {
    throw new Error("Choose either a single hour or an hour range.");
  }

  const startHour = input.hour ?? input.fromHour ?? 0;
  const endHour =
    input.hour !== undefined ? input.hour + 1 : input.toHour ?? 24;

  let start: Date;
  let end: Date;

  if (input.day !== undefined) {
    start = fromColomboParts(
      input.year,
      input.month ?? 1,
      input.day,
      startHour,
    );
    end =
      endHour >= 24
        ? fromColomboParts(input.year, input.month ?? 1, input.day + 1, endHour - 24)
        : fromColomboParts(input.year, input.month ?? 1, input.day, endHour);
    if (
      input.hour === undefined &&
      input.fromHour === undefined &&
      input.toHour === undefined
    ) {
      end = fromColomboParts(input.year, input.month ?? 1, input.day + 1);
    }
  } else if (input.month !== undefined) {
    start = fromColomboParts(input.year, input.month, 1);
    end = fromColomboParts(input.year, input.month + 1, 1);
  } else {
    start = fromColomboParts(input.year, 1, 1);
    end = fromColomboParts(input.year + 1, 1, 1);
  }

  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

export function isWithinAdvance(
  startAt: Date | string,
  now: Date | string,
  maxAdvanceDays: number,
): boolean {
  const start = asDate(startAt).getTime();
  const nowMs = asDate(now).getTime();
  return start <= nowMs + maxAdvanceDays * 24 * HOUR_MS;
}

export function formatExpiryRelative(expiresAt: Date | string, now: Date | string): string {
  const remaining = asDate(expiresAt).getTime() - asDate(now).getTime();
  if (remaining <= 0) return "expired";
  const minutes = Math.ceil(remaining / MINUTE_MS);
  if (minutes < 60) return `${minutes} min`;
  return formatDuration(minutes);
}
