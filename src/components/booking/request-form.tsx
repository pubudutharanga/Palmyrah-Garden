"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock3, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { getBoardRoom, getRoomCategory, isRoomNumber } from "@/content/room-board";
import { formatLKR } from "@/lib/money";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { createBookingRequest } from "@/lib/prototype/engine";
import { quoteInterval } from "@/lib/prototype/pricing";
import { readPeriodFromQuery } from "@/lib/prototype/period-url";
import { runPrototypeAction } from "@/lib/prototype/store";
import { getRoomStatus } from "@/lib/prototype/status";
import { formatColomboDateTime, formatDuration } from "@/lib/prototype/time";

export function RequestForm() {
  const state = usePrototypeState();
  const now = usePrototypeClock(30_000);
  usePrototypeExpiry(now);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}`,
  );

  const ready = Boolean(state) && now > 0;
  const roomParam = searchParams.get("room") ?? "";
  const room = isRoomNumber(roomParam) ? getBoardRoom(roomParam) : undefined;
  const period = useMemo(
    () => (ready ? readPeriodFromQuery(searchParams, now) : null),
    [ready, searchParams, now],
  );

  const status =
    state && room && period
      ? getRoomStatus(room.number, state, period.startAt, period.endAt, new Date(now), "guest")
      : null;
  const available = status?.status === "available";

  let quote = null;
  if (room && period) {
    try {
      quote = quoteInterval({
        startAt: period.startAt,
        endAt: period.endAt,
        roomNumber: room.number,
        now: new Date(now),
      });
    } catch {
      quote = null;
    }
  }

  function submit() {
    if (!room || !period || !state) return;
    setSubmitting(true);
    setError(null);

    const result = runPrototypeAction((current) =>
      createBookingRequest(
        current,
        {
          roomNumber: room.number,
          startAt: period.startAt,
          endAt: period.endAt,
          adults,
          children,
          guest: {
            name,
            phone,
            email,
            nationality,
            notes,
          },
          idempotencyKey,
        },
        new Date(now),
      ),
    );

    if (result.ok) {
      toast.success(`Request ${result.data.booking.ref} sent to the resort.`);
      router.push(`/booking/${result.data.booking.ref}`);
      return;
    }

    setSubmitting(false);
    setError(result.message);
  }

  const boardHref = `/rooms?from=${encodeURIComponent(
    period?.startAt ?? new Date(now).toISOString(),
  )}&to=${encodeURIComponent(
    period?.endAt ?? new Date(now + 24 * 60 * 60 * 1000).toISOString(),
  )}`;

  if (!ready) {
    return (
      <div className="shell py-12">
        <div className="h-10 w-64 animate-pulse rounded bg-dune/70" />
        <div className="mt-6 h-96 max-w-2xl animate-pulse rounded-panel bg-dune/50" />
      </div>
    );
  }

  if (!room || !period) {
    return (
      <div className="shell py-12">
        <p className="text-sm text-gulf">Direct request</p>
        <h1 className="h1 mt-3">Choose a room first.</h1>
        <p className="mt-4 max-w-xl text-ink/65">
          Start from the live room board, pick a time window and tap the room you want.
        </p>
        <Link href="/rooms" className={buttonClasses({ className: "mt-6" })}>
          Open the room board
        </Link>
      </div>
    );
  }

  return (
    <div className="shell grid gap-10 py-8 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <Link
          href={boardHref}
          className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Change room or window
        </Link>
        <p className="mt-6 text-sm text-gulf">Request to book</p>
        <h1 className="h1 mt-2">
          Room {room.number}
          {room.wing ? `, ${room.wing}.` : "."}
        </h1>
        {room.category ? (
          <p className="mt-1 inline-flex rounded-full border border-ink/15 px-2.5 py-1 text-xs font-medium text-ink/70">
            {getRoomCategory(room.number)?.label ?? "Room"}
          </p>
        ) : null}
        <p className="mt-3 max-w-xl text-ink/65">
          Send the request now and the resort will confirm it. No payment is taken on
          this page; you pay at the counter when you arrive.
        </p>

        {!available ? (
          <div className="mt-6 rounded-panel border border-danger/30 bg-danger/5 p-4 text-sm text-ink">
            <p className="font-medium">
              Room {room.number} is not free for the whole window.
            </p>
            <p className="mt-1 text-ink/65">
              {status?.status === "pending"
                ? "Someone has requested it and it is waiting for approval."
                : status?.availableAgainAt
                  ? `It is free again from ${formatColomboDateTime(status.availableAgainAt)}.`
                  : "Pick another room or shift the window."}
            </p>
            <Link href={boardHref} className={buttonClasses({ size: "sm", className: "mt-4" })}>
              Back to the board
            </Link>
          </div>
        ) : null}

        <form
          className="mt-8 space-y-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="guest-name">
              <Input
                id="guest-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field
              label="Phone (with country code)"
              htmlFor="guest-phone"
              hint="The resort replies by WhatsApp or phone."
            >
              <Input
                id="guest-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+94 77 000 0000"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </Field>
            <Field label="Email (optional)" htmlFor="guest-email">
              <Input
                id="guest-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Nationality (optional)" htmlFor="guest-nationality">
              <Input
                id="guest-nationality"
                name="nationality"
                autoComplete="country-name"
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
              />
            </Field>
            <Field label="Adults" htmlFor="guest-adults">
              <Select
                id="guest-adults"
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value))}
              >
                <option value={1}>1 adult</option>
                <option value={2}>2 adults</option>
              </Select>
            </Field>
            <Field label="Children" htmlFor="guest-children">
              <Select
                id="guest-children"
                value={children}
                onChange={(event) => setChildren(Number(event.target.value))}
              >
                <option value={0}>No children</option>
                <option value={1}>1 child</option>
              </Select>
            </Field>
          </div>

          <Field
            label="Special requests (optional)"
            htmlFor="guest-notes"
            hint="Late arrival, road-side quiet, extra towels, anything else."
          >
            <Textarea
              id="guest-notes"
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>

          {error ? (
            <p className="rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={!available || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending request…
                </>
              ) : (
                "Send request"
              )}
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-ink/50">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Payment at the counter only
            </p>
          </div>
        </form>
      </div>

      <aside className="lg:col-span-5">
        <div className="rounded-panel border border-dune bg-salt p-5 shadow-lift lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">
                Your window
              </p>
              <p className="mt-1 font-display text-2xl leading-none">
                Room {room.number}
              </p>
              <p className="mt-1 text-sm text-ink/60">
                {room.wing} · {getRoomCategory(room.number)?.label ?? "Room"}
              </p>
            </div>
            <Badge tone={available ? "available" : status?.status === "pending" ? "held" : "booked"}>
              {available ? "Free" : status?.status === "pending" ? "Requested" : "Booked"}
            </Badge>
          </div>

          <dl className="mt-5 space-y-2 border-y border-dune py-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/55">Arrive</dt>
              <dd className="tnum text-right font-medium">
                {formatColomboDateTime(period.startAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/55">Depart</dt>
              <dd className="tnum text-right font-medium">
                {formatColomboDateTime(period.endAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-ink/55">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Duration
              </dt>
              <dd className="tnum font-medium">
                {quote ? quote.durationLabel : formatDuration(
                  (new Date(period.endAt).getTime() - new Date(period.startAt).getTime()) /
                    60_000,
                )}
              </dd>
            </div>
          </dl>

          {quote ? (
            <div className="mt-4">
              <ul className="space-y-1.5 text-sm text-ink/70">
                {quote.lines.map((line) => (
                  <li key={line.description} className="flex justify-between gap-4">
                    <span>{line.description}</span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
                {quote.taxLines.map((line) => (
                  <li key={line.code} className="flex justify-between gap-4">
                    <span>
                      {line.label} {line.percent}%
                    </span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-dune pt-3">
                <span className="text-sm font-medium">Total to pay at the counter</span>
                <span className="tnum font-display text-2xl">{formatLKR(quote.total)}</span>
              </div>
              <p className="mt-2 text-xs text-ink/50">
                Sample rates — TODO(client). Service charge and VAT are included above.
              </p>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
