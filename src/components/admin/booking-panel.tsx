"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ban,
  BedDouble,
  Check,
  Eye,
  EyeOff,
  FileText,
  LogIn,
  Mail,
  Pencil,
  Phone,
  Printer,
  Receipt,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { formatLKR } from "@/lib/money";
import {
  approveBooking,
  balanceFor,
  cancelBooking,
  checkInBooking,
  editBookingWindow,
  generateBill,
  logPiiReveal,
  markNoShow,
  paidFor,
  rejectBooking,
} from "@/lib/prototype/engine";
import { runPrototypeAction } from "@/lib/prototype/store";
import { formatColomboDateTime, parseColomboInput, toColomboInput } from "@/lib/prototype/time";
import type { PrototypeBooking, StayStatus } from "@/lib/prototype/types";

const STAY_TONE: Record<StayStatus, "neutral" | "available" | "held" | "booked" | "blocked" | "danger"> = {
  pending_approval: "held",
  approved: "available",
  checked_in: "available",
  checked_out: "booked",
  rejected: "danger",
  cancelled: "neutral",
  no_show: "danger",
  expired: "neutral",
};

const STAY_LABEL: Record<StayStatus, string> = {
  pending_approval: "Pending approval",
  approved: "Approved",
  checked_in: "In house",
  checked_out: "Checked out",
  rejected: "Rejected",
  cancelled: "Cancelled",
  no_show: "No show",
  expired: "Expired",
};

export function BookingPanel({
  booking,
  now,
}: {
  booking: PrototypeBooking;
  now: number;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [editing, setEditing] = useState(false);
  const [editFrom, setEditFrom] = useState<string | null>(null);
  const [editTo, setEditTo] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastBill, setLastBill] = useState<string | null>(null);

  const balance = balanceFor(booking);
  const paid = paidFor(booking);
  const currentDocuments = booking.documents.filter(
    (document) => document.type !== "BILL" || document.isCurrent,
  );

  function approve() {
    const result = runPrototypeAction((state) =>
      approveBooking(state, booking.ref, new Date(now)),
    );
    if (result.ok) toast.success(`${booking.ref} approved.`);
    else toast.error(result.message);
  }

  function reject() {
    const result = runPrototypeAction((state) =>
      rejectBooking(state, booking.ref, rejectReason, new Date(now)),
    );
    if (result.ok) {
      toast.success(`${booking.ref} rejected.`);
      setRejecting(false);
    } else {
      toast.error(result.message);
    }
  }

  function checkIn() {
    const result = runPrototypeAction((state) =>
      checkInBooking(state, booking.ref, new Date(now)),
    );
    if (result.ok) toast.success(`${booking.ref} checked in.`);
    else toast.error(result.message);
  }

  function noShow() {
    const result = runPrototypeAction((state) =>
      markNoShow(state, booking.ref, new Date(now)),
    );
    if (result.ok) toast.success(`${booking.ref} marked no-show.`);
    else toast.error(result.message);
  }

  function cancel() {
    const result = runPrototypeAction((state) =>
      cancelBooking(state, booking.ref, new Date(now)),
    );
    if (result.ok) toast.success(`${booking.ref} cancelled.`);
    else toast.error(result.message);
  }

  function makeBill() {
    const result = runPrototypeAction((state) =>
      generateBill(state, booking.ref, new Date(now)),
    );
    if (result.ok) {
      setLastBill(result.data.document.number);
      toast.success(`Bill ${result.data.document.number} generated.`);
    } else {
      toast.error(result.message);
    }
  }

  function saveWindow() {
    const from = parseColomboInput(editFrom ?? toColomboInput(booking.startAt));
    const to = parseColomboInput(editTo ?? toColomboInput(booking.endAt));
    if (!from || !to) {
      setEditError("Enter a valid start and end.");
      return;
    }
    const result = runPrototypeAction((state) =>
      editBookingWindow(
        state,
        booking.ref,
        { startAt: from.toISOString(), endAt: to.toISOString() },
        new Date(now),
      ),
    );
    if (result.ok) {
      toast.success("Window updated.");
      setEditing(false);
      setEditError(null);
    } else {
      setEditError(result.message);
    }
  }

  function revealId() {
    if (!booking.guest.idNumber) return;
    const result = runPrototypeAction((state) =>
      logPiiReveal(state, booking.ref, new Date(now)),
    );
    if (result.ok) setRevealed(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={STAY_TONE[booking.status]}>{STAY_LABEL[booking.status]}</Badge>
        <span className="tnum text-sm text-ink/55">{booking.ref}</span>
        {booking.pendingExpiresAt ? (
          <span className="text-xs text-ink/50">
            hold expires {formatColomboDateTime(booking.pendingExpiresAt)}
          </span>
        ) : null}
      </div>

      <dl className="grid gap-4 border-y border-dune py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-ink/45">Window</dt>
          <dd className="mt-1 font-medium">
            {formatColomboDateTime(booking.startAt)}
          </dd>
          <dd className="text-ink/60">
            to {formatColomboDateTime(booking.endAt)} · {booking.quote.durationLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-ink/45">Guests</dt>
          <dd className="mt-1 font-medium">
            {booking.guests.adults} adults
            {booking.guests.children > 0 ? `, ${booking.guests.children} child` : ""}
          </dd>
          <dd className="text-ink/60">
            {booking.guest.nationality ?? "Nationality not given"}
          </dd>
        </div>
      </dl>

      <section aria-label="Guest details" className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UserRound className="h-4 w-4 text-frond" aria-hidden="true" />
          Guest
        </h3>
        <p className="font-medium">{booking.guest.name}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/65">
          <a href={`tel:${booking.guest.phone}`} className="link-quiet inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {booking.guest.phone}
          </a>
          {booking.guest.email ? (
            <a href={`mailto:${booking.guest.email}`} className="link-quiet inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {booking.guest.email}
            </a>
          ) : null}
        </div>
        {booking.guest.vehicleNumber ? (
          <p className="text-sm text-ink/65">Vehicle {booking.guest.vehicleNumber}</p>
        ) : null}
        {booking.guest.idNumber ? (
          <p className="flex items-center gap-2 text-sm text-ink/65">
            ID:{" "}
            <span className="tnum">
              {revealed ? booking.guest.idNumber : "•••• •••• ••••"}
            </span>
            <button
              type="button"
              onClick={revealId}
              className="inline-flex items-center gap-1 text-xs text-gulf underline decoration-gulf/30 underline-offset-4"
            >
              {revealed ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  Shown
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Reveal
                </>
              )}
            </button>
          </p>
        ) : null}
        {booking.guest.notes ? (
          <p className="rounded-input bg-dune/60 px-3 py-2 text-sm text-ink/75">
            {booking.guest.notes}
          </p>
        ) : null}
      </section>

      <section aria-label="Money" className="rounded-panel border border-dune p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Receipt className="h-4 w-4 text-frond" aria-hidden="true" />
          Money
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-ink/70">
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
        <div className="mt-3 space-y-1 border-t border-dune pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <span>Total</span>
            <span className="tnum font-medium">{formatLKR(booking.quote.total)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Paid</span>
            <span className="tnum font-medium">{formatLKR(paid)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Balance</span>
            <span className="tnum font-display text-xl">{formatLKR(balance)}</span>
          </div>
        </div>
        {booking.payments.length > 0 ? (
          <ul className="mt-3 space-y-1 border-t border-dune pt-3 text-xs text-ink/60">
            {booking.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between gap-4">
                <span>
                  {payment.method.replace("_", " ")} · {payment.receiptNumber}
                </span>
                <span className="tnum">{formatLKR(payment.amount)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {currentDocuments.length > 0 ? (
        <section aria-label="Documents" className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-frond" aria-hidden="true" />
            Documents
          </h3>
          <ul className="space-y-1.5">
            {currentDocuments.map((document) => (
              <li key={document.number} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="tnum">{document.number}</span>
                <Link
                  href={`/admin/billing/documents/${document.number}/show`}
                  className="link-quiet"
                >
                  Show
                </Link>
                <a
                  href={`/admin/billing/documents/${document.number}/print?format=a4`}
                  className="link-quiet"
                  target="_blank"
                  rel="noreferrer"
                >
                  Print
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Actions" className="space-y-3 border-t border-dune pt-4">
        {booking.status === "pending_approval" ? (
          rejecting ? (
            <div className="space-y-2 rounded-input border border-danger/30 bg-danger/5 p-3">
              <label htmlFor={`reject-${booking.ref}`} className="text-sm font-medium">
                Reason for rejection
              </label>
              <Textarea
                id={`reject-${booking.ref}`}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                className="min-h-20 bg-salt"
              />
              <div className="flex gap-2">
                <Button type="button" variant="destructive" size="sm" onClick={reject}>
                  Reject request
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
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={approve}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Approve
              </Button>
              <Button type="button" variant="secondary" onClick={() => setRejecting(true)}>
                <Ban className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
            </div>
          )
        ) : null}

        {booking.status === "approved" ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={checkIn}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Check in
            </Button>
            <Button type="button" variant="secondary" onClick={makeBill}>
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Generate bill
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit window
            </Button>
            <Button type="button" variant="ghost" onClick={noShow}>
              No show
            </Button>
            <Button type="button" variant="ghost" onClick={cancel}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        ) : null}

        {booking.status === "checked_in" ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={makeBill}>
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Generate bill
            </Button>
            <Link
              href={`/admin/front-desk/check-out/${booking.ref}`}
              className={buttonClasses({ variant: "secondary" })}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Check out &amp; print
            </Link>
          </div>
        ) : null}

        {booking.status === "checked_out" ? (
          <Link
            href={`/admin/front-desk/check-out/${booking.ref}`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <BedDouble className="h-4 w-4" aria-hidden="true" />
            Open folio
          </Link>
        ) : null}

        {editing ? (
          <div className="space-y-2 rounded-input border border-dune bg-dune/30 p-3">
            <p className="text-sm font-medium">Edit the stay window</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-ink/55">
                Start
                <Input
                  type="datetime-local"
                  step={3600}
                  value={editFrom ?? toColomboInput(booking.startAt)}
                  onChange={(event) => setEditFrom(event.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="text-xs text-ink/55">
                End
                <Input
                  type="datetime-local"
                  step={3600}
                  value={editTo ?? toColomboInput(booking.endAt)}
                  onChange={(event) => setEditTo(event.target.value)}
                  className="mt-1"
                />
              </label>
            </div>
            {editError ? (
              <p className="text-sm text-danger" role="alert">
                {editError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={saveWindow}>
                Save window
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditFrom(null);
                  setEditTo(null);
                  setEditError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {lastBill ? (
          <p className="text-sm text-ink/65">
            Latest bill{" "}
            <Link
              href={`/admin/billing/documents/${lastBill}/show`}
              className="link-quiet tnum"
            >
              {lastBill}
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
