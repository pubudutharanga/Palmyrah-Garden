"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  Users,
} from "lucide-react";

import { StayCalendar } from "@/components/booking/stay-calendar";
import { Button } from "@/components/ui/button";
import { formatDisplay, type DateKey } from "@/lib/dates";
import { bookingHref, DEFAULT_STAY, guestSummary, roomSummary } from "@/lib/stay";
import { stayQuerySchema } from "@/lib/validators/stay";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<
  Record<"checkIn" | "checkOut" | "adults" | "children" | "rooms", string>
>;

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p id={id} className="text-sm font-medium text-ink">
          {label}
        </p>
        {hint ? <p className="text-xs text-ink/50">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-1" role="group" aria-labelledby={id}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-dune disabled:opacity-30"
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="tnum w-8 text-center text-sm font-medium" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-dune disabled:opacity-30"
          aria-label={`More ${label.toLowerCase()}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

const triggerBase =
  "flex min-h-14 w-full flex-col justify-center rounded-input px-4 py-2.5 text-left transition-colors hover:bg-dune/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gulf";

const popoverClass =
  "z-50 rounded-panel border border-dune bg-salt p-4 shadow-lift outline-none md:p-5";

export function BookingBar({
  initial,
  roomType,
  variant = "bar",
  onDatesChange,
  onSubmitted,
  className,
}: {
  initial?: {
    checkIn?: DateKey;
    checkOut?: DateKey;
    adults?: number;
    children?: number;
    rooms?: number;
  };
  roomType?: string;
  variant?: "bar" | "stack";
  onDatesChange?: (checkIn: DateKey, checkOut: DateKey) => void;
  onSubmitted?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<DateKey | undefined>(initial?.checkIn);
  const [checkOut, setCheckOut] = useState<DateKey | undefined>(initial?.checkOut);
  const [adults, setAdults] = useState(initial?.adults ?? DEFAULT_STAY.adults);
  const [children, setChildren] = useState(initial?.children ?? DEFAULT_STAY.children);
  const [rooms, setRooms] = useState(initial?.rooms ?? DEFAULT_STAY.rooms);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);

  function submit() {
    const nextErrors: FieldErrors = {};
    if (!checkIn) nextErrors.checkIn = "Choose a check-in date.";
    if (!checkOut) nextErrors.checkOut = "Choose a check-out date.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setDatesOpen(true);
      return;
    }

    const parsed = stayQuerySchema.safeParse({
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      roomType,
    });

    if (!parsed.success) {
      const mapped: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          field === "checkIn" ||
          field === "checkOut" ||
          field === "adults" ||
          field === "children" ||
          field === "rooms"
        ) {
          mapped[field] ??= issue.message;
        }
      }
      setErrors(mapped);
      if (mapped.checkIn || mapped.checkOut) setDatesOpen(true);
      return;
    }

    setErrors({});
    setSubmitting(true);
    onSubmitted?.();
    router.push(bookingHref(parsed.data));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(
        variant === "bar"
          ? "rounded-panel border border-dune bg-salt p-2 shadow-lift"
          : "space-y-2",
        className,
      )}
      noValidate
    >
      <div
        className={cn(
          variant === "bar"
            ? "grid gap-1 md:grid-cols-[1.05fr_1.05fr_0.8fr_auto] md:items-stretch"
            : "grid gap-1",
        )}
      >
        <Popover.Root open={datesOpen} onOpenChange={setDatesOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              data-booking-dates
              className={cn(triggerBase, "relative")}
              aria-describedby={errors.checkIn || errors.checkOut ? "date-error" : undefined}
            >
              <span className="text-[11px] font-medium text-ink/50">
                {checkIn && checkOut ? "Your stay" : "Dates"}
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <CalendarDays className="h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                {checkIn && checkOut ? (
                  <span className="tnum truncate">
                    {formatDisplay(checkIn, { year: undefined })} –{" "}
                    {formatDisplay(checkOut)}
                  </span>
                ) : checkIn ? (
                  <span className="tnum">{formatDisplay(checkIn)}</span>
                ) : (
                  "Add your dates"
                )}
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={8}
              collisionPadding={16}
              className={cn(popoverClass, "w-[min(94vw,660px)]")}
            >
              <StayCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={(start, end) => {
                  setCheckIn(start);
                  setCheckOut(end);
                  if (end) {
                    setErrors((current) => ({
                      ...current,
                      checkIn: undefined,
                      checkOut: undefined,
                    }));
                    onDatesChange?.(start, end);
                    setDatesOpen(false);
                  }
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root open={guestsOpen} onOpenChange={setGuestsOpen}>
          <Popover.Trigger asChild>
            <button type="button" className={triggerBase}>
              <span className="text-[11px] font-medium text-ink/50">Guests</span>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <Users className="h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                <span className="truncate">{guestSummary(adults, children)}</span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 text-ink/40" aria-hidden="true" />
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={8}
              collisionPadding={16}
              className={cn(popoverClass, "w-[min(92vw,320px)]")}
            >
              <div className="divide-y divide-dune">
                <Stepper
                  label="Adults"
                  hint="Age 13 and over"
                  value={adults}
                  min={1}
                  max={6}
                  onChange={setAdults}
                />
                <Stepper
                  label="Children"
                  hint="Age 12 and under"
                  value={children}
                  min={0}
                  max={4}
                  onChange={setChildren}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setGuestsOpen(false)}
              >
                Done
              </Button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root open={roomsOpen} onOpenChange={setRoomsOpen}>
          <Popover.Trigger asChild>
            <button type="button" className={triggerBase}>
              <span className="text-[11px] font-medium text-ink/50">Rooms</span>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <BedDouble className="h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                <span className="truncate">{roomSummary(rooms)}</span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 text-ink/40" aria-hidden="true" />
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              collisionPadding={16}
              className={cn(popoverClass, "w-[min(92vw,300px)]")}
            >
              <Stepper
                label="Rooms"
                hint="One adult per room is needed"
                value={rooms}
                min={1}
                max={5}
                onChange={(value) => {
                  setRooms(value);
                  if (adults < value) setAdults(value);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setRoomsOpen(false)}
              >
                Done
              </Button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Button
          type="submit"
          size="lg"
          className={cn("md:mx-1 md:my-auto", variant === "stack" ? "w-full" : "w-full")}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking…
            </>
          ) : (
            "Check availability"
          )}
        </Button>
      </div>

      {errors.checkIn || errors.checkOut ? (
        <p id="date-error" className="px-4 pb-2 pt-1 text-sm text-danger" role="alert">
          {errors.checkIn ?? errors.checkOut}
        </p>
      ) : null}
      {errors.adults || errors.children || errors.rooms ? (
        <p className="px-4 pb-2 pt-1 text-sm text-danger" role="alert">
          {errors.adults ?? errors.children ?? errors.rooms}
        </p>
      ) : null}
    </form>
  );
}
