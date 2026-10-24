"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { validateWindow } from "@/lib/prototype/pricing";
import {
  formatDuration,
  minutesBetween,
  parseColomboInput,
  periodFromDates,
  presetsFor,
  toColomboInput,
  type Period,
} from "@/lib/prototype/time";
import { cn } from "@/lib/utils";

export function PeriodControl({
  now,
  period,
  onChange,
  className,
}: {
  now: number;
  period: Period | null;
  onChange: (period: Period) => void;
  className?: string;
}) {
  const [draftFrom, setDraftFrom] = useState<string | null>(null);
  const [draftTo, setDraftTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!period) return null;
  const activePeriod = period;
  const presets = presetsFor(new Date(now));

  function choose(preset: "now" | "tonight" | "tomorrow") {
    setDraftFrom(null);
    setDraftTo(null);
    setError(null);
    onChange(presets[preset]);
  }

  function applyCustom() {
    const fromValue = draftFrom ?? toColomboInput(activePeriod.startAt);
    const toValue = draftTo ?? toColomboInput(activePeriod.endAt);
    const from = parseColomboInput(fromValue);
    const to = parseColomboInput(toValue);
    if (!from || !to) {
      setError("Enter a valid date and time for both fields.");
      return;
    }
    const validation = validateWindow(
      { startAt: from.toISOString(), endAt: to.toISOString() },
      new Date(now),
      { allowPast: true },
    );
    if (!validation.ok) {
      setError(validation.message);
      if (validation.suggestion) {
        setDraftFrom(validation.suggestion);
      }
      return;
    }
    setError(null);
    onChange(periodFromDates(from, to, "custom"));
  }

  const duration = minutesBetween(activePeriod.startAt, activePeriod.endAt);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="inline-flex rounded-full border border-ink/15 bg-salt p-0.5">
        {(["now", "tonight", "tomorrow"] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={activePeriod.preset === preset}
            onClick={() => choose(preset)}
            className={cn(
              "min-h-9 rounded-full px-3.5 text-xs font-medium capitalize transition-colors",
              activePeriod.preset === preset
                ? "bg-ink text-salt"
                : "text-ink/70 hover:bg-dune",
            )}
          >
            {preset === "now" ? "Now" : preset}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <CalendarClock className="hidden h-4 w-4 text-ink/45 sm:block" aria-hidden="true" />
        <label className="sr-only" htmlFor="board-from">
          Board period start
        </label>
        <Input
          id="board-from"
          type="datetime-local"
          step={3600}
          value={draftFrom ?? toColomboInput(activePeriod.startAt)}
          onChange={(event) => setDraftFrom(event.target.value)}
          className="h-10 min-h-10 w-[11.5rem] px-3 py-0 text-xs"
        />
        <span className="text-xs text-ink/45">to</span>
        <label className="sr-only" htmlFor="board-to">
          Board period end
        </label>
        <Input
          id="board-to"
          type="datetime-local"
          step={3600}
          value={draftTo ?? toColomboInput(activePeriod.endAt)}
          onChange={(event) => setDraftTo(event.target.value)}
          className="h-10 min-h-10 w-[11.5rem] px-3 py-0 text-xs"
        />
        <Button type="button" size="sm" variant="secondary" onClick={applyCustom}>
          Apply
        </Button>
      </div>

      <p className="w-full text-xs text-ink/50 sm:w-auto" aria-live="polite">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : (
          <>
            {activePeriod.label}: {formatDuration(duration)} · no payment taken now
          </>
        )}
      </p>
    </div>
  );
}
