"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { usePrototypeClock } from "@/lib/prototype/hooks";
import { validateWindow } from "@/lib/prototype/pricing";
import {
  addMinutes,
  formatDuration,
  minutesBetween,
  parseColomboInput,
  presetsFor,
  toColomboInput,
} from "@/lib/prototype/time";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import { cn } from "@/lib/utils";

export function TimeWindowBar({
  variant = "bar",
  className,
  onSubmitted,
}: {
  variant?: "bar" | "stack";
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const now = usePrototypeClock(60_000);
  const [fromDraft, setFromDraft] = useState<string | null>(null);
  const [toDraft, setToDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const base = now ? presetsFor(new Date(now)).now : null;
  const fromValue = fromDraft ?? (base ? toColomboInput(base.startAt) : "");
  const toValue =
    toDraft ??
    (fromDraft
      ? (() => {
          const parsed = parseColomboInput(fromDraft);
          return parsed
            ? toColomboInput(addMinutes(parsed, 24 * 60))
            : base
              ? toColomboInput(base.endAt)
              : "";
        })()
      : base
        ? toColomboInput(base.endAt)
        : "");

  const fromParsed = parseColomboInput(fromValue);
  const toParsed = parseColomboInput(toValue);
  const duration =
    fromParsed && toParsed && toParsed > fromParsed
      ? minutesBetween(fromParsed, toParsed)
      : null;

  function submit() {
    const from = parseColomboInput(fromValue);
    const to = parseColomboInput(toValue);
    if (!from || !to) {
      setError("Choose both an arrival and a departure time.");
      return;
    }
    const validation = validateWindow(
      { startAt: from.toISOString(), endAt: to.toISOString() },
      new Date(now || Date.now()),
    );
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setError(null);
    setSubmitting(true);
    onSubmitted?.();
    router.push(
      `/rooms?from=${encodeURIComponent(validation.startAt)}&to=${encodeURIComponent(
        validation.endAt,
      )}`,
    );
  }

  const fieldClass =
    "flex min-h-16 flex-col justify-center gap-0.5 rounded-input px-4 py-2 text-left transition-colors focus-within:bg-dune/40 hover:bg-dune/35";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      noValidate
      className={cn(
        variant === "bar"
          ? "rounded-panel border border-dune bg-salt p-2 shadow-lift"
          : "rounded-panel border border-dune bg-salt p-3",
        className,
      )}
    >
      <div
        className={cn(
          variant === "bar"
            ? "grid gap-1 md:grid-cols-[1fr_1fr_auto] md:items-stretch"
            : "space-y-2",
        )}
      >
        <label className={fieldClass}>
          <span className="text-[11px] font-medium text-ink/50">Arrive</span>
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
            <Input
              data-booking-dates
              type="datetime-local"
              step={3600}
              value={fromValue}
              onChange={(event) => {
                setFromDraft(event.target.value);
                setError(null);
              }}
              className="h-7 min-h-7 border-0 bg-transparent p-0 text-sm font-medium focus-visible:outline-0"
            />
          </span>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-medium text-ink/50">Depart</span>
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
            <Input
              type="datetime-local"
              step={3600}
              value={toValue}
              onChange={(event) => {
                setToDraft(event.target.value);
                setError(null);
              }}
              className="h-7 min-h-7 border-0 bg-transparent p-0 text-sm font-medium focus-visible:outline-0"
            />
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || !now}
          className={variant === "stack" ? "w-full" : "w-full md:my-1 md:w-auto"}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking…
            </>
          ) : (
            "Check the board"
          )}
        </Button>
      </div>

      {error ? (
        <p className="px-4 pb-2 pt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        <p className="px-4 pb-2 pt-2 text-xs text-ink/50">
          {duration
            ? `${formatDuration(duration)} · minimum ${formatDuration(
                PROTOTYPE_SETTINGS.stay.minMinutes,
              )}.`
            : `Choose any window from ${formatDuration(
                PROTOTYPE_SETTINGS.stay.minMinutes,
              )} to ${formatDuration(PROTOTYPE_SETTINGS.stay.maxMinutes)}.`}{" "}
          No payment now; all rooms share one rate.
        </p>
      )}
    </form>
  );
}
