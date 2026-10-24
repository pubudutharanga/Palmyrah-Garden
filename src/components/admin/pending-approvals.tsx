"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock3, MessageCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { formatLKR } from "@/lib/money";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { approveBooking, rejectBooking } from "@/lib/prototype/engine";
import { runPrototypeAction } from "@/lib/prototype/store";
import {
  formatColomboDateTime,
  formatExpiryRelative,
} from "@/lib/prototype/time";
import type { PrototypeBooking } from "@/lib/prototype/types";

function PendingRow({ booking, now }: { booking: PrototypeBooking; now: number }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    const result = runPrototypeAction((state) =>
      approveBooking(state, booking.ref, new Date(now)),
    );
    if (result.ok) toast.success(`${booking.ref} approved.`);
    else toast.error(result.message);
  }

  function reject() {
    const result = runPrototypeAction((state) =>
      rejectBooking(state, booking.ref, reason, new Date(now)),
    );
    if (result.ok) {
      toast.success(`${booking.ref} rejected.`);
      setRejecting(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <article className="rounded-panel border border-dune bg-salt p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="held">Pending</Badge>
            <span className="tnum text-sm text-ink/55">{booking.ref}</span>
            <span className="rounded-full bg-dune px-2 py-0.5 text-xs font-medium">
              Room {booking.roomNumber}
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl leading-tight">
            {booking.guest.name}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {booking.guest.phone}
            {booking.guest.email ? ` · ${booking.guest.email}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="tnum font-display text-2xl">{formatLKR(booking.quote.total)}</p>
          <p className="text-xs text-ink/45">pay at the counter</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-y border-dune py-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-ink/45">Window</dt>
          <dd className="mt-1">
            {formatColomboDateTime(booking.startAt)}
            <span className="block text-ink/55">to {formatColomboDateTime(booking.endAt)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-ink/45">Duration</dt>
          <dd className="mt-1">{booking.quote.durationLabel}</dd>
          <dd className="text-ink/55">
            {booking.guests.adults} adults
            {booking.guests.children > 0 ? `, ${booking.guests.children} child` : ""}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-ink/45">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Hold
          </dt>
          <dd className="mt-1">
            {booking.pendingExpiresAt
              ? `${formatExpiryRelative(booking.pendingExpiresAt, new Date(now))} left`
              : "Expiring"}
          </dd>
          <dd className="text-ink/55">Oldest first</dd>
        </div>
      </dl>

      {booking.guest.notes ? (
        <p className="mt-3 rounded-input bg-dune/50 px-3 py-2 text-sm text-ink/70">
          {booking.guest.notes}
        </p>
      ) : null}

      {rejecting ? (
        <div className="mt-4 space-y-2 rounded-input border border-danger/30 bg-danger/5 p-3">
          <label htmlFor={`reason-${booking.ref}`} className="text-sm font-medium">
            Reason for rejection
          </label>
          <Textarea
            id={`reason-${booking.ref}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-20 bg-salt"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="destructive" size="sm" onClick={reject}>
              Reject {booking.ref}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejecting(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={approve}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Approve
          </Button>
          <Button type="button" variant="secondary" onClick={() => setRejecting(true)}>
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Reject
          </Button>
          <Link
            href={`/admin/room-board?room=${booking.roomNumber}&from=${encodeURIComponent(
              booking.startAt,
            )}&to=${encodeURIComponent(booking.endAt)}`}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            Open on board
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hello ${booking.guest.name}, this is Palmyrah Garden about request ${booking.ref} for room ${booking.roomNumber}.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      )}
    </article>
  );
}

export function PendingApprovals() {
  const state = usePrototypeState();
  const now = usePrototypeClock();
  usePrototypeExpiry(now);

  if (!state || now === 0) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-dune/70" />
        <div className="mt-6 h-64 max-w-3xl animate-pulse rounded-panel bg-dune/50" />
      </div>
    );
  }

  const pending = state.bookings
    .filter((booking) => booking.status === "pending_approval")
    .sort((a, b) => (a.pendingExpiresAt ?? "").localeCompare(b.pendingExpiresAt ?? ""));

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="max-w-4xl">
        <p className="text-sm text-gulf">Live queue</p>
        <h1 className="h1 mt-2">Approvals</h1>
        <p className="mt-3 max-w-2xl text-ink/65">
          Requests stay amber on the room board until someone approves them. Holds
          expire after {Math.round(120 / 60)} hours and release the room automatically.
        </p>

        {pending.length === 0 ? (
          <div className="mt-8 rounded-panel border border-dune bg-dune/30 p-8 text-center">
            <p className="font-display text-2xl">Nothing waiting.</p>
            <p className="mt-2 text-sm text-ink/60">
              New guest requests appear here and on the room board.
            </p>
            <Link
              href="/admin/room-board"
              className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-4" })}
            >
              Back to the board
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {pending.map((booking) => (
              <PendingRow key={booking.id} booking={booking} now={now} />
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-ink/45">
          WhatsApp and email delivery are simulated in this prototype. The
          notification is logged locally; the WhatsApp button opens a prefilled chat.
        </p>
      </div>
    </div>
  );
}
