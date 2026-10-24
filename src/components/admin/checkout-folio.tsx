"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Check,
  FileText,
  Loader2,
  LogIn,
  Printer,
  Receipt,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { formatLKR } from "@/lib/money";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import {
  balanceFor,
  checkInBooking,
  checkOutBooking,
  findBooking,
  generateBill,
  paidFor,
  recordPayment,
} from "@/lib/prototype/engine";
import { currentBill } from "@/lib/prototype/documents";
import { runPrototypeAction } from "@/lib/prototype/store";
import { formatColomboDateTime } from "@/lib/prototype/time";
import type { PaymentMethod, StayStatus } from "@/lib/prototype/types";

const STATUS_LABEL: Record<StayStatus, string> = {
  pending_approval: "Pending approval",
  approved: "Approved — not yet checked in",
  checked_in: "In house",
  checked_out: "Checked out",
  rejected: "Rejected",
  cancelled: "Cancelled",
  no_show: "No show",
  expired: "Expired",
};

const STATUS_TONE: Record<
  StayStatus,
  "neutral" | "available" | "held" | "booked" | "blocked" | "danger"
> = {
  pending_approval: "held",
  approved: "available",
  checked_in: "available",
  checked_out: "booked",
  rejected: "danger",
  cancelled: "neutral",
  no_show: "danger",
  expired: "neutral",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export function CheckoutFolio({ reference }: { reference: string }) {
  const state = usePrototypeState();
  const now = usePrototypeClock(30_000);
  usePrototypeExpiry(now);

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [draftAmount, setDraftAmount] = useState<string | null>(null);
  const [draftTendered, setDraftTendered] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [unsettledReason, setUnsettledReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);

  if (!state || now === 0) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-dune/70" />
        <div className="mt-6 h-[60vh] max-w-4xl animate-pulse rounded-panel bg-dune/50" />
      </div>
    );
  }

  const booking = findBooking(state, reference);
  if (!booking) {
    return (
      <div className="px-4 py-12 lg:px-8">
        <p className="text-sm text-gulf">Check-out folio</p>
        <h1 className="h1 mt-2">No booking {reference}.</h1>
        <Link
          href="/admin/bookings/history"
          className={buttonClasses({ className: "mt-6" })}
        >
          Booking history
        </Link>
      </div>
    );
  }

  const balance = balanceFor(booking);
  const paid = paidFor(booking);
  const bill = currentBill(booking);
  const activeRef = booking.ref;
  const amountValue =
    draftAmount ?? (balance > 0 ? (balance / 100).toFixed(2) : "");
  const tenderedValue =
    draftTendered ?? (method === "cash" && balance > 0 ? (balance / 100).toFixed(2) : "");
  const canPay =
    (booking.status === "approved" || booking.status === "checked_in") &&
    balance > 0;
  const canCheckOut = booking.status === "checked_in";

  function prepareBill() {
    const result = runPrototypeAction((current) =>
      generateBill(current, activeRef, new Date(now)),
    );
    if (result.ok) toast.success(`Bill ${result.data.document.number} generated.`);
    else toast.error(result.message);
  }

  function pay() {
    const major = Number(amountValue);
    if (!Number.isFinite(major) || major <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    const amount = Math.round(major * 100);
    const tendered =
      method === "cash" && tenderedValue.trim()
        ? Math.round(Number(tenderedValue) * 100)
        : undefined;
    if (tendered !== undefined && !Number.isFinite(tendered)) {
      setError("Enter a valid cash amount tendered.");
      return;
    }

    setBusy(true);
    setError(null);
    const result = runPrototypeAction((current) => {
      let working = current;
      const latest = findBooking(working, activeRef);
      if (!latest) {
        return {
          ok: false as const,
          code: "NOT_FOUND" as const,
          message: "Booking not found.",
        };
      }
      if (!currentBill(latest)) {
        const billResult = generateBill(working, activeRef, new Date(now));
        if (!billResult.ok) return billResult;
        working = billResult.state;
      }
      return recordPayment(
        working,
        activeRef,
        {
          method,
          amount,
          tendered,
          reference: paymentReference,
        },
        new Date(now),
      );
    });

    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDraftAmount(null);
    setDraftTendered(null);
    setPaymentReference("");
    setLastReceipt(result.data.receipt.number);
    toast.success(`Receipt ${result.data.receipt.number} recorded.`);
  }

  function checkIn() {
    const result = runPrototypeAction((current) =>
      checkInBooking(current, activeRef, new Date(now)),
    );
    if (result.ok) {
      toast.success(`${activeRef} checked in.`);
      return;
    }
    toast.error(result.message);
  }

  function checkOut() {
    setBusy(true);
    setError(null);
    const result = runPrototypeAction((current) =>
      checkOutBooking(
        current,
        activeRef,
        { unsettledReason },
        new Date(now),
      ),
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setLastInvoice(result.data.invoice.number);
    toast.success(`Checked out. Final invoice ${result.data.invoice.number}.`);
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/bookings/history"
            className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Booking history
          </Link>
          <Link
            href={`/admin/room-board?room=${booking.roomNumber}`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
            Room {booking.roomNumber} on the board
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gulf">Check-out folio</p>
            <h1 className="h1 mt-2">Room {booking.roomNumber}</h1>
            <p className="mt-2 text-ink/65">
              {booking.guest.name} · {booking.guest.phone}
            </p>
          </div>
          <div className="text-right">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge tone={STATUS_TONE[booking.status]}>
                {STATUS_LABEL[booking.status]}
              </Badge>
              <span className="tnum text-sm text-ink/55">{booking.ref}</span>
            </div>
            <p className="tnum mt-2 text-sm text-ink/60">
              {formatColomboDateTime(booking.startAt)}
            </p>
            <p className="tnum text-sm text-ink/60">
              to {formatColomboDateTime(booking.endAt)} · {booking.quote.durationLabel}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-7" aria-label="Folio">
            <div className="rounded-panel border border-dune bg-salt p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl">
                  <Receipt className="h-5 w-5 text-frond" aria-hidden="true" />
                  Bill
                </h2>
                {bill ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="tnum">{bill.number}</span>
                    <Link
                      href={`/admin/billing/documents/${bill.number}/show`}
                      className="link-quiet"
                    >
                      Show
                    </Link>
                    <a
                      href={`/admin/billing/documents/${bill.number}/print?format=a4`}
                      target="_blank"
                      rel="noreferrer"
                      className="link-quiet inline-flex items-center gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                      Print
                    </a>
                  </div>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={prepareBill}>
                    Generate bill
                  </Button>
                )}
              </div>

              <ul className="mt-4 space-y-2 border-y border-dune py-4 text-sm">
                {booking.quote.lines.map((line) => (
                  <li key={line.description} className="flex justify-between gap-4">
                    <span className="text-ink/70">{line.description}</span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
                {booking.quote.taxLines.map((line) => (
                  <li key={line.code} className="flex justify-between gap-4">
                    <span className="text-ink/70">
                      {line.label} {line.percent}%
                    </span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Total</dt>
                  <dd className="tnum font-medium">{formatLKR(booking.quote.total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Paid</dt>
                  <dd className="tnum font-medium">{formatLKR(paid)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-dune pt-2">
                  <dt className="font-medium">Balance due</dt>
                  <dd className="tnum font-display text-3xl">{formatLKR(balance)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink/45">
                Sample rates and tax figures — TODO(client). Service charge and VAT are
                included in the total.
              </p>
            </div>

            <div className="rounded-panel border border-dune bg-salt p-5">
              <h2 className="font-display text-2xl">Payments</h2>
              {booking.payments.length === 0 ? (
                <p className="mt-2 text-sm text-ink/60">
                  No payments recorded yet. Recording a payment will generate a bill
                  first if one is missing.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-dune text-sm">
                  {booking.payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <p className="tnum font-medium">{payment.receiptNumber}</p>
                        <p className="text-xs text-ink/55">
                          {formatColomboDateTime(payment.createdAt)} ·{" "}
                          {PAYMENT_LABEL[payment.method]}
                          {payment.reference ? ` · ${payment.reference}` : ""}
                        </p>
                      </div>
                      <span className="tnum font-medium">{formatLKR(payment.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-panel border border-dune bg-salt p-5">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <FileText className="h-5 w-5 text-frond" aria-hidden="true" />
                Documents
              </h2>
              {booking.documents.length === 0 ? (
                <p className="mt-2 text-sm text-ink/60">No documents issued.</p>
              ) : (
                <ul className="mt-3 divide-y divide-dune text-sm">
                  {booking.documents.map((document) => (
                    <li
                      key={document.number}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <p className="tnum font-medium">
                          {document.number}
                          {!document.isCurrent ? (
                            <span className="ml-2 text-xs text-danger">superseded</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-ink/55">
                          {document.type === "BILL"
                            ? "Bill"
                            : document.type === "RECEIPT"
                              ? "Receipt"
                              : "Final invoice"}{" "}
                          · {formatColomboDateTime(document.issuedAt)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/billing/documents/${document.number}/show`}
                          className="link-quiet"
                        >
                          Show
                        </Link>
                        <a
                          href={`/admin/billing/documents/${document.number}/print?format=a4`}
                          target="_blank"
                          rel="noreferrer"
                          className="link-quiet"
                        >
                          A4
                        </a>
                        <a
                          href={`/admin/billing/documents/${document.number}/print?format=80mm`}
                          target="_blank"
                          rel="noreferrer"
                          className="link-quiet"
                        >
                          80 mm
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-5">
            <div className="no-print rounded-panel border border-dune bg-dune/30 p-5 lg:sticky lg:top-6">
              <h2 className="font-display text-2xl">Counter payment</h2>

              {booking.status === "checked_out" ? (
                <div className="mt-3 rounded-input border border-frond/30 bg-frond/10 p-3 text-sm">
                  <p className="flex items-center gap-1.5 font-medium text-frond">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Checked out
                  </p>
                  <p className="mt-1 text-ink/65">
                    {booking.checkedOutAt
                      ? formatColomboDateTime(booking.checkedOutAt)
                      : "Closed"}
                    {lastInvoice ? ` · ${lastInvoice}` : ""}
                  </p>
                  {booking.unsettledReason ? (
                    <p className="mt-2 text-xs text-danger">
                      Unsettled: {booking.unsettledReason}
                    </p>
                  ) : null}
                </div>
              ) : booking.status === "approved" ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-ink/65">
                    Check the guest in before taking payment or checking out.
                  </p>
                  <Button type="button" onClick={checkIn}>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Check in {booking.guest.name.split(" ")[0]}
                  </Button>
                </div>
              ) : canPay ? (
                <div className="mt-3 space-y-3">
                  <label className="block text-sm">
                    <span className="text-ink/60">Method</span>
                    <Select
                      value={method}
                      onChange={(event) => {
                        setMethod(event.target.value as PaymentMethod);
                        setError(null);
                      }}
                      className="mt-1"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="other">Other</option>
                    </Select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-ink/60">Amount received (LKR)</span>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={amountValue}
                      onChange={(event) => setDraftAmount(event.target.value)}
                      className="mt-1 tnum"
                    />
                  </label>
                  {method === "cash" ? (
                    <label className="block text-sm">
                      <span className="text-ink/60">Cash tendered (LKR)</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={tenderedValue}
                        onChange={(event) => setDraftTendered(event.target.value)}
                        className="mt-1 tnum"
                      />
                    </label>
                  ) : (
                    <label className="block text-sm">
                      <span className="text-ink/60">Reference (optional)</span>
                      <Input
                        value={paymentReference}
                        onChange={(event) => setPaymentReference(event.target.value)}
                        placeholder="Card slip or transfer reference"
                        className="mt-1"
                      />
                    </label>
                  )}
                  {lastReceipt ? (
                    <p className="rounded-input border border-frond/30 bg-frond/10 px-3 py-2 text-sm">
                      Receipt{" "}
                      <Link
                        href={`/admin/billing/documents/${lastReceipt}/show`}
                        className="link-quiet tnum"
                      >
                        {lastReceipt}
                      </Link>{" "}
                      recorded.{" "}
                      <a
                        href={`/admin/billing/documents/${lastReceipt}/print?format=80mm`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-ink/25 underline-offset-2"
                      >
                        Print 80 mm
                      </a>
                    </p>
                  ) : null}
                  {error ? (
                    <p className="text-sm text-danger" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button type="button" onClick={pay} disabled={busy} className="w-full">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Receipt className="h-4 w-4" aria-hidden="true" />
                    )}
                    Record payment
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink/60">
                  This booking cannot take a payment in its current state.
                </p>
              )}

              {canCheckOut ? (
                <div className="mt-5 space-y-3 border-t border-ink/15 pt-4">
                  <h3 className="font-medium">Complete check-out</h3>
                  {balance > 0 ? (
                    <label className="block text-sm">
                      <span className="text-ink/60">
                        Balance still due. Give a reason to check out unsettled.
                      </span>
                      <Textarea
                        value={unsettledReason}
                        onChange={(event) => setUnsettledReason(event.target.value)}
                        placeholder="Approved by the owner, invoice to follow…"
                        className="mt-1 min-h-20 bg-salt"
                      />
                    </label>
                  ) : null}
                  {error && !canPay ? (
                    <p className="text-sm text-danger" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant={balance > 0 ? "secondary" : "primary"}
                    onClick={checkOut}
                    disabled={busy || (balance > 0 && unsettledReason.trim().length < 3)}
                    className="w-full"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    Check out &amp; issue final invoice
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="no-print rounded-panel border border-dune p-4 text-xs text-ink/55">
              <p className="font-medium text-ink/70">Prototype note</p>
              <p className="mt-1">
                All payments are recorded locally. No card processor is connected.
                Final numbering uses INV; bills use BILL and receipts use RCT.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
