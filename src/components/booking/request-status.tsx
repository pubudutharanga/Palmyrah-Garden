"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Check,
  Clock3,
  FileText,
  Phone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { formatLKR } from "@/lib/money";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { balanceFor, cancelBooking, paidFor } from "@/lib/prototype/engine";
import { runPrototypeAction } from "@/lib/prototype/store";
import {
  formatColomboDateTime,
  formatExpiryRelative,
} from "@/lib/prototype/time";
import type { StayStatus } from "@/lib/prototype/types";
import { cn } from "@/lib/utils";

const STAY_META: Record<
  StayStatus,
  { label: string; tone: "neutral" | "available" | "held" | "booked" | "blocked" | "danger"; note: string }
> = {
  pending_approval: {
    label: "Awaiting approval",
    tone: "held",
    note: "The resort has your request and will confirm it shortly.",
  },
  approved: {
    label: "Confirmed",
    tone: "available",
    note: "Your room is held. Pay at the counter when you arrive.",
  },
  checked_in: {
    label: "In house",
    tone: "available",
    note: "You are checked in. Call reception if you need anything.",
  },
  checked_out: {
    label: "Checked out",
    tone: "booked",
    note: "Thank you for staying. Your final invoice is below.",
  },
  rejected: {
    label: "Not available",
    tone: "danger",
    note: "The resort could not confirm this request.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    note: "This request was cancelled.",
  },
  no_show: {
    label: "No show",
    tone: "danger",
    note: "The room was not collected for this window.",
  },
  expired: {
    label: "Expired",
    tone: "neutral",
    note: "The approval window passed and the room was released.",
  },
};

const STEPS = ["Requested", "Approved", "In house", "Checked out"] as const;

function stepIndex(status: StayStatus): number {
  if (status === "pending_approval") return 0;
  if (status === "approved") return 1;
  if (status === "checked_in") return 2;
  if (status === "checked_out") return 3;
  return -1;
}

export function RequestStatus({ reference }: { reference: string }) {
  const state = usePrototypeState();
  const now = usePrototypeClock(30_000);
  usePrototypeExpiry(now);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (!state || now === 0) {
    return (
      <div className="shell py-12">
        <div className="h-8 w-52 animate-pulse rounded bg-dune/70" />
        <div className="mt-6 h-80 max-w-3xl animate-pulse rounded-panel bg-dune/50" />
      </div>
    );
  }

  const booking = state.bookings.find((item) => item.ref === reference);
  if (!booking) {
    return (
      <div className="shell py-12">
        <p className="text-sm text-gulf">Request</p>
        <h1 className="h1 mt-3">We cannot find {reference}.</h1>
        <p className="mt-4 max-w-xl text-ink/65">
          Check the link, or open the room board and send a fresh request.
        </p>
        <Link href="/rooms" className={buttonClasses({ className: "mt-6" })}>
          Open the room board
        </Link>
      </div>
    );
  }

  const meta = STAY_META[booking.status];
  const activeIndex = stepIndex(booking.status);
  const canCancel =
    booking.status === "pending_approval" || booking.status === "approved";
  const balance = balanceFor(booking);
  const paid = paidFor(booking);

  function cancel() {
    const result = runPrototypeAction((current) =>
      cancelBooking(current, reference, new Date(now)),
    );
    if (result.ok) {
      toast.success("Request cancelled.");
      setConfirmingCancel(false);
      return;
    }
    toast.error(result.message);
  }

  const whatsappText = encodeURIComponent(
    `Hello Palmyrah Garden. My booking reference is ${booking.ref} for room ${booking.roomNumber}.`,
  );

  return (
    <div className="shell py-10 lg:py-14">
      <Link href="/rooms" className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink/60">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Room board
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="tnum text-sm text-ink/50">{booking.ref}</span>
          </div>
          <h1 className="h1 mt-4">
            Room {booking.roomNumber}, {booking.guest.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 max-w-xl text-ink/65">{meta.note}</p>

          {booking.status === "pending_approval" && booking.pendingExpiresAt ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Held for {formatExpiryRelative(booking.pendingExpiresAt, new Date(now))} while the
              resort confirms.
            </p>
          ) : null}

          {booking.status === "rejected" && booking.rejectionReason ? (
            <p className="mt-3 rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-sm">
              Reason: {booking.rejectionReason}
            </p>
          ) : null}

          <dl className="mt-8 grid gap-5 border-y border-dune py-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Arrive</dt>
              <dd className="tnum mt-1 font-medium">
                {formatColomboDateTime(booking.startAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Depart</dt>
              <dd className="tnum mt-1 font-medium">
                {formatColomboDateTime(booking.endAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Guests</dt>
              <dd className="mt-1 font-medium">
                {booking.guests.adults} adults
                {booking.guests.children > 0
                  ? `, ${booking.guests.children} child`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Window</dt>
              <dd className="mt-1 font-medium">{booking.quote.durationLabel}</dd>
            </div>
          </dl>

          {activeIndex >= 0 ? (
            <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-[11px] uppercase tracking-[0.08em]">
              {STEPS.map((step, index) => (
                <li key={step} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      index <= activeIndex
                        ? "border-frond bg-frond text-salt"
                        : "border-ink/20 bg-salt text-ink/40",
                    )}
                  >
                    {index < activeIndex ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className={index <= activeIndex ? "text-ink" : "text-ink/40"}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              Message the resort
            </a>
            <Link href="/contact" className={buttonClasses({ variant: "ghost", size: "sm" })}>
              Contact details
            </Link>
            {canCancel ? (
              confirmingCancel ? (
                <span className="flex items-center gap-2">
                  <Button type="button" variant="destructive" size="sm" onClick={cancel}>
                    Yes, cancel {booking.ref}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingCancel(false)}
                  >
                    Keep it
                  </Button>
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingCancel(true)}
                >
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel request
                </Button>
              )
            ) : null}
          </div>

          {booking.status === "expired" || booking.status === "rejected" ? (
            <div className="mt-8 rounded-panel border border-dune bg-dune/30 p-4">
              <p className="font-medium">The room was released.</p>
              <p className="mt-1 text-sm text-ink/65">
                Open the board and pick another free room or a different window.
              </p>
              <Link
                href={`/rooms?from=${encodeURIComponent(
                  booking.startAt,
                )}&to=${encodeURIComponent(booking.endAt)}`}
                className={buttonClasses({ size: "sm", className: "mt-4" })}
              >
                Try another room
              </Link>
            </div>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-panel border border-dune bg-salt p-5 shadow-lift lg:sticky lg:top-28">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-frond" aria-hidden="true" />
              <p className="font-medium">Room {booking.roomNumber}</p>
            </div>

            <ul className="mt-4 space-y-1.5 border-b border-dune pb-4 text-sm text-ink/70">
              {booking.quote.lines.map((line) => (
                <li key={line.description} className="flex justify-between gap-4">
                  <span>{line.description}</span>
                  <span className="tnum">{formatLKR(line.amount)}</span>
                </li>
              ))}
              {booking.quote.taxLines.map((line) => (
                <li key={line.code} className="flex justify-between gap-4">
                  <span>
                    {line.label} {line.percent}%
                  </span>
                  <span className="tnum">{formatLKR(line.amount)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-ink/55">Total</span>
                <span className="tnum font-medium">{formatLKR(booking.quote.total)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink/55">Paid at the counter</span>
                <span className="tnum font-medium">{formatLKR(paid)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink/55">Balance</span>
                <span className="tnum font-display text-xl">{formatLKR(balance)}</span>
              </div>
            </div>

            {booking.documents.length > 0 ? (
              <div className="mt-5 border-t border-dune pt-4">
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">
                  Documents
                </p>
                <ul className="mt-2 space-y-2">
                  {booking.documents.map((document) => (
                    <li key={document.number}>
                      <Link
                        href={`/booking/${booking.ref}/documents/${document.number}`}
                        className="link-quiet inline-flex items-center gap-1.5 text-sm"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        {document.type === "FINAL"
                          ? "Final invoice"
                          : document.type === "RECEIPT"
                            ? "Receipt"
                            : "Bill"}{" "}
                        {document.number}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {booking.status === "pending_approval" ? (
              <p className="mt-5 rounded-input border border-jaggery/40 bg-jaggery/10 px-3 py-2 text-xs text-ink/70">
                Prototype: the request is saved in this browser. Approve it from the
                admin room board to see the status change here.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
