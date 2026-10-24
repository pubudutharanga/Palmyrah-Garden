"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import type { AvailabilityDay } from "@/lib/types";
import {
  addDays,
  compareKeys,
  diffNights,
  formatDisplay,
  formatMonth,
  makeDateKey,
  todayKey,
  type DateKey,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

type CalendarPayload = {
  total: number;
  days: AvailabilityDay[];
};

async function fetchCalendar(from: DateKey, to: DateKey): Promise<CalendarPayload> {
  const response = await fetch(`/api/v1/availability?from=${from}&to=${to}`, {
    cache: "no-store",
  });
  const body = (await response.json()) as
    | { ok: true; data: CalendarPayload }
    | { ok: false; error: { message: string } };
  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthStart(key: DateKey): DateKey {
  return makeDateKey(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 1);
}

function shiftMonth(key: DateKey, delta: number): DateKey {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return makeDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

function monthCells(month: DateKey): (DateKey | null)[] {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7));
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const cells: (DateKey | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(makeDateKey(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function StayCalendar({
  checkIn,
  checkOut,
  onSelect,
  onComplete,
  months = 2,
}: {
  checkIn?: DateKey;
  checkOut?: DateKey;
  onSelect: (checkIn: DateKey, checkOut?: DateKey) => void;
  onComplete?: (checkIn: DateKey, checkOut: DateKey) => void;
  months?: 1 | 2;
}) {
  const today = todayKey();
  const maxDate = addDays(today, 365);
  const [view, setView] = useState<DateKey>(() =>
    monthStart(checkIn ?? today),
  );
  const [activeDay, setActiveDay] = useState<DateKey | null>(null);

  const secondMonth = shiftMonth(view, 1);
  const rangeFrom = compareKeys(view, today) < 0 ? today : view;
  const rangeTo = shiftMonth(secondMonth, 1);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["availability-calendar", rangeFrom, rangeTo],
    queryFn: () => fetchCalendar(rangeFrom, rangeTo),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const daysByDate = useMemo(() => {
    const map = new Map<DateKey, AvailabilityDay>();
    for (const day of data?.days ?? []) map.set(day.date, day);
    return map;
  }, [data]);

  const announce = (() => {
    const day = activeDay ?? checkIn;
    if (!day) return "Choose a check-in date to see rooms left.";
    const remaining = daysByDate.get(day)?.remaining;
    if (remaining === undefined) {
      return `${formatDisplay(day)}. Availability is loading.`;
    }
    return remaining === 0
      ? `${formatDisplay(day)} is full.`
      : `${remaining} of ${data?.total ?? 46} rooms free on ${formatDisplay(day)}.`;
  })();

  function choose(day: DateKey) {
    if (!checkIn || checkOut) {
      onSelect(day);
      return;
    }
    if (compareKeys(day, checkIn) <= 0) {
      onSelect(day);
      return;
    }
    onSelect(checkIn, day);
    onComplete?.(checkIn, day);
  }

  function renderMonth(month: DateKey, hiddenOnMobile = false) {
    const cells = monthCells(month);
    return (
      <div className={cn("flex-1", hiddenOnMobile ? "hidden sm:block" : "")}>
        <p className="mb-3 text-center text-sm font-medium text-ink">
          {formatMonth(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1)}
        </p>
        <div className="grid grid-cols-7 gap-y-1">
          {WEEKDAYS.map((label) => (
            <span
              key={label}
              className="pb-1 text-center text-[11px] font-medium text-ink/45"
              aria-hidden="true"
            >
              {label}
            </span>
          ))}
          {cells.map((day, index) => {
            if (!day) return <span key={`blank-${index}`} />;
            const info = daysByDate.get(day);
            const isFull = info?.remaining === 0;
            const disabled =
              compareKeys(day, today) < 0 || compareKeys(day, maxDate) > 0 || isFull;
            const isStart = day === checkIn;
            const isEnd = day === checkOut;
            const inRange =
              Boolean(checkIn && checkOut) &&
              compareKeys(day, checkIn as DateKey) > 0 &&
              compareKeys(day, checkOut as DateKey) < 0;
            const isToday = day === today;

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => choose(day)}
                onMouseEnter={() => setActiveDay(day)}
                onFocus={() => setActiveDay(day)}
                aria-label={`${formatDisplay(day, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}, ${isFull ? "full" : info ? `${info.remaining} rooms free` : "availability loading"}`}
                aria-pressed={isStart || isEnd}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-[13px] leading-none transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gulf",
                  disabled
                    ? "cursor-not-allowed text-ink/30"
                    : "hover:bg-dune/70",
                  inRange ? "bg-dune/80" : "",
                  isStart || isEnd
                    ? "bg-frond text-salt hover:bg-frond"
                    : "",
                  isToday && !isStart && !isEnd
                    ? "ring-1 ring-inset ring-gulf/40"
                    : "",
                )}
              >
                <span className={cn("tnum", isStart || isEnd ? "font-semibold" : "")}>
                  {Number(day.slice(8, 10))}
                </span>
                {isFull ? (
                  <span className="mt-0.5 text-[9px] leading-none">Full</span>
                ) : info ? (
                  <span
                    className={cn(
                      "mt-0.5 text-[9px] leading-none tnum",
                      isStart || isEnd ? "text-salt/75" : "text-ink/40",
                    )}
                  >
                    {info.remaining}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(shiftMonth(view, -1))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 hover:bg-dune disabled:opacity-30"
          aria-label="Previous month"
          disabled={compareKeys(view, monthStart(today)) <= 0}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 text-xs text-ink/55">
          {isFetching ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
          {isError ? "Availability unavailable" : null}
        </div>
        <button
          type="button"
          onClick={() => setView(shiftMonth(view, 1))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 hover:bg-dune disabled:opacity-30"
          aria-label="Next month"
          disabled={compareKeys(shiftMonth(view, 1), maxDate) >= 0}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex gap-6">
        {renderMonth(view)}
        {months === 2 ? renderMonth(secondMonth, true) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dune pt-3 text-xs text-ink/60">
        <span>
          {checkIn && checkOut
            ? `${diffNights(checkIn, checkOut)} nights, ${formatDisplay(checkIn)} to ${formatDisplay(checkOut)}`
            : checkIn
              ? "Choose a check-out date"
              : "Choose a check-in date"}
        </span>
        {checkIn && checkOut ? (
          <button
            type="button"
            onClick={() => onSelect(checkIn)}
            className="min-h-11 rounded-full px-3 text-xs font-medium text-gulf hover:bg-dune/60"
          >
            Change dates
          </button>
        ) : null}
      </div>
    </div>
  );
}
