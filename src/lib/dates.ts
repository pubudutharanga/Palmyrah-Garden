import { RESORT } from "@/lib/constants";

/**
 * Stay dates are date-only keys on the resort calendar. Never derive one with
 * `toISOString().slice(0, 10)` — that is UTC and can be the previous day.
 */
export type DateKey = string & { readonly __dateKey: unique symbol };

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string") return false;
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return isRealCalendarDate(year, month, day);
}

function isRealCalendarDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseDateKey(key: DateKey | string): Date {
  if (!isDateKey(key)) throw new Error(`Invalid date key: ${String(key)}`);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function makeDateKey(year: number, month: number, day: number): DateKey {
  const key = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(
    day,
  ).padStart(2, "0")}`;
  if (!isDateKey(key)) throw new Error(`Invalid date: ${key}`);
  return key;
}

/** Uses the local calendar fields of a Date, not UTC. */
export function fromLocalDate(date: Date): DateKey {
  return makeDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function toDateKey(date: Date, timeZone = RESORT.timezone): DateKey {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return makeDateKey(read("year"), read("month"), read("day"));
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now, RESORT.timezone);
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = parseDateKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return makeDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function compareKeys(a: DateKey, b: DateKey): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function diffNights(checkIn: DateKey, checkOut: DateKey): number {
  const millis = parseDateKey(checkOut).getTime() - parseDateKey(checkIn).getTime();
  return Math.round(millis / 86_400_000);
}

/** Returns the half-open list of nights `[checkIn, checkOut)`. */
export function nightsBetween(checkIn: DateKey, checkOut: DateKey): DateKey[] {
  const nights: DateKey[] = [];
  const total = diffNights(checkIn, checkOut);
  for (let index = 0; index < total; index += 1) {
    nights.push(addDays(checkIn, index));
  }
  return nights;
}

/** Half-open ranges overlap when one starts before the other ends. */
export function rangesOverlap(
  aStart: DateKey,
  aEnd: DateKey,
  bStart: DateKey,
  bEnd: DateKey,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function formatDisplay(
  key: DateKey,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(parseDateKey(key));
}

export function formatDayMonth(key: DateKey): string {
  return formatDisplay(key, { year: undefined });
}

export function formatWeekday(key: DateKey): string {
  return formatDisplay(key, { weekday: "short", day: undefined, month: undefined, year: undefined });
}

export function formatDateRange(checkIn: DateKey, checkOut: DateKey): string {
  const sameMonth = checkIn.slice(0, 7) === checkOut.slice(0, 7);
  const start = formatDisplay(checkIn, sameMonth ? { year: undefined } : {});
  return `${start} – ${formatDisplay(checkOut)}`;
}

export function formatMonth(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

/** The resort's "now" as a DateKey and the milliseconds until local midnight. */
export function stayClock(now: Date = new Date()): { today: DateKey; nowIso: string } {
  return { today: todayKey(now), nowIso: now.toISOString() };
}

export function hoursUntilCheckIn(checkIn: DateKey, now: Date = new Date()): number {
  const checkInAt = parseDateKey(checkIn).getTime();
  return (checkInAt - now.getTime()) / 3_600_000;
}

export function isPastKey(key: DateKey, now: Date = new Date()): boolean {
  return key < todayKey(now);
}
