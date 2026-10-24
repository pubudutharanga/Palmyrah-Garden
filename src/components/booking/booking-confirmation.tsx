"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Printer,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resort } from "@/content/resort";
import { recallBooking } from "@/lib/booking-session";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { formatDateRange } from "@/lib/dates";
import { formatLKR } from "@/lib/money";
import type { BookingRecord } from "@/lib/types";

type CancellationResponse = {
  booking: BookingRecord;
  freeCancellation: boolean;
  chargeNote: string;
};

export function BookingConfirmation({
  reference,
  token,
  initial,
  serverError,
  isNew,
}: {
  reference: string;
  token: string | null;
  initial: BookingRecord | null;
  serverError: string | null;
  isNew: boolean;
}) {
  const [booking, setBooking] = useState<BookingRecord | null>(initial);
  const [accessToken, setAccessToken] = useState<string | null>(token);
  const [restored, setRestored] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guestCount = useMemo(() => {
    if (!booking) return { adults: 0, children: 0 };
    return booking.rooms.reduce(
      (sum, room) => ({
        adults: sum.adults + room.adults,
        children: sum.children + room.children,
      }),
      { adults: 0, children: 0 },
    );
  }, [booking]);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      toast.success("Booking reference copied.");
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      toast.error("Could not copy the reference.");
    }
  }

  function restoreFromBrowser() {
    const cached = recallBooking(reference);
    if (!cached) {
      toast.error("No demo booking for that reference was found in this browser.");
      return;
    }
    setBooking(cached.booking);
    setAccessToken((current) => cached.token ?? current);
    setRestored(true);
  }

  async function cancel() {
    if (!accessToken) {
      setCancelError("This link is missing its access key. Contact us and we will help.");
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await apiRequest<CancellationResponse>(
        `/api/v1/bookings/${reference}/cancel?t=${encodeURIComponent(accessToken)}`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setBooking(result.booking);
      setCancelNote(result.chargeNote);
      setCancelOpen(false);
      toast.success("The booking has been cancelled.");
    } catch (error) {
      setCancelError(
        error instanceof ApiClientError
          ? error.message
          : "We could not cancel that booking. Please contact us.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (!booking) {
    return (
      <div className="shell pb-24 pt-12 md:pt-16">
        <div className="max-w-2xl">
          <p className="text-sm text-gulf">Booking</p>
          <h1 className="h1 mt-3">We could not open this booking.</h1>
          <p className="mt-4 text-ink/65">
            {serverError ??
              "That link is incomplete or has expired. Use the full link from your booking confirmation, or contact us with the reference below."}
          </p>
          <div className="mt-6 rounded-panel border border-dune bg-dune/30 p-5">
            <p className="text-xs text-ink/45">Reference</p>
            <p className="tnum mt-1 font-display text-2xl tracking-[0.04em]">
              {reference}
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Contact the resort</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to the garden</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-ink/45">
            If this is a demo booking made in this browser, you can look for it in
            this browser&apos;s temporary storage.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={restoreFromBrowser}>
              Restore demo booking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cancelled = booking.status === "cancelled";
  const depositDue = booking.payment.method === "deposit" && !booking.payment.depositPaid;
  const balance = booking.quote.total - (booking.payment.depositPaid ? booking.quote.depositDue : 0);

  return (
    <>
      <div className="shell pb-24 pt-10 md:pt-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gulf">Booking {reference}</p>
            <h1 className="h1 mt-2">
              {cancelled
                ? "This booking is cancelled."
                : isNew
                  ? "You are booked."
                  : "Your booking."}
            </h1>
            <p className="mt-3 max-w-xl text-ink/60">
              {cancelled
                ? "No rooms are held for these dates. If this was not intended, contact us and we will help."
                : `A confirmation has been prepared for ${booking.guest.firstName}. Keep this page or print it for arrival.`}
            </p>
          </div>
          <Badge tone={cancelled ? "danger" : "available"}>
            {cancelled ? "Cancelled" : "Confirmed"}
          </Badge>
        </div>

        {restored ? (
          <p className="mt-5 rounded-input border border-jaggery/35 bg-jaggery/[0.07] px-4 py-3 text-xs text-ink/60">
            This demo booking was restored from this browser. Save the reference and
            access link if you need it later.
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="rounded-panel border border-dune bg-dune/30 p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                    Your reference
                  </p>
                  <p className="tnum mt-1 font-display text-3xl tracking-[0.05em]">
                    {reference}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={copyReference}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <dl className="mt-6 grid gap-5 border-t border-ink/10 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-ink/45">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Stay
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {formatDateRange(booking.checkIn, booking.checkOut)}
                  </dd>
                  <dd className="mt-0.5 text-xs text-ink/50">
                    {booking.nights} {booking.nights === 1 ? "night" : "nights"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/45">Guests</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {guestCount.adults} {guestCount.adults === 1 ? "adult" : "adults"}
                    {guestCount.children > 0
                      ? `, ${guestCount.children} ${
                          guestCount.children === 1 ? "child" : "children"
                        }`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/45">Arrival</dt>
                  <dd className="mt-1 text-sm font-medium">
                    From {resort.stay.checkInTime}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/45">Departure</dt>
                  <dd className="mt-1 text-sm font-medium">
                    By {resort.stay.checkOutTime}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="rooms-heading">
              <h2 id="rooms-heading" className="h3">
                Rooms
              </h2>
              <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                {booking.rooms.map((room) => (
                  <li
                    key={room.roomId}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{room.roomTypeName}</p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        Room {room.roomNumber}
                      </p>
                    </div>
                    <p className="text-xs text-ink/50">
                      {room.adults} {room.adults === 1 ? "adult" : "adults"}
                      {room.children > 0
                        ? `, ${room.children} ${
                            room.children === 1 ? "child" : "children"
                          }`
                        : ""}
                      {", "}
                      {booking.mealPlan === "RO"
                        ? "Room only"
                        : booking.mealPlan === "BB"
                          ? "Breakfast"
                          : booking.mealPlan === "HB"
                            ? "Half board"
                            : "Full board"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="guest-heading">
              <h2 id="guest-heading" className="h3">
                Guest
              </h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink/45">Name</dt>
                  <dd className="mt-1">
                    {booking.guest.firstName} {booking.guest.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/45">Email</dt>
                  <dd className="mt-1 break-all">
                    <a href={`mailto:${booking.guest.email}`} className="link-quiet">
                      {booking.guest.email}
                    </a>
                  </dd>
                </div>
                {booking.guest.phone ? (
                  <div>
                    <dt className="text-xs text-ink/45">Phone</dt>
                    <dd className="mt-1">{booking.guest.phone}</dd>
                  </div>
                ) : null}
                {booking.guest.country ? (
                  <div>
                    <dt className="text-xs text-ink/45">Country</dt>
                    <dd className="mt-1">{booking.guest.country}</dd>
                  </div>
                ) : null}
                {booking.guest.notes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-ink/45">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-ink/70">
                      {booking.guest.notes}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="h3">
                Payment
              </h2>
              <div className="mt-4 rounded-panel border border-dune p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {booking.payment.method === "deposit"
                        ? booking.payment.depositPaid
                          ? "Deposit paid"
                          : "Deposit due"
                        : "Pay at the resort"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/50">
                      {booking.payment.method === "deposit"
                        ? booking.payment.depositPaid
                          ? "The remaining balance is payable on arrival."
                          : "The demonstration payment has not been completed."
                        : "No payment has been taken. The full amount is payable on arrival."}
                    </p>
                  </div>
                  {!cancelled && depositDue ? (
                    <Button asChild size="sm">
                      <Link
                        href={`/booking/${reference}/pay?t=${encodeURIComponent(
                          accessToken ?? "",
                        )}`}
                      >
                        Pay deposit
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              {cancelNote ? (
                <p className="mt-3 rounded-input border border-dune bg-dune/30 px-3 py-2 text-xs text-ink/60">
                  {cancelNote}
                </p>
              ) : null}
            </section>

            <section aria-labelledby="price-heading">
              <h2 id="price-heading" className="h3">
                Price
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-ink/60">
                    {booking.quote.lines.some((line) => line.type === "MEAL_PLAN")
                      ? "Rooms and meals"
                      : "Rooms"}
                  </p>
                  <p className="tnum">{formatLKR(booking.quote.subtotal)}</p>
                </div>
                {booking.quote.taxLines.map((tax) => (
                  <div
                    key={tax.code}
                    className="flex items-baseline justify-between gap-4 text-ink/60"
                  >
                    <p>
                      {tax.label} ({tax.percent}%)
                    </p>
                    <p className="tnum">{formatLKR(tax.amount)}</p>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 border-t border-ink/15 pt-3">
                  <p className="font-medium">Total</p>
                  <p className="tnum text-base font-semibold">
                    {formatLKR(booking.quote.total)}
                  </p>
                </div>
                {booking.payment.method === "deposit" ? (
                  <>
                    <div className="flex items-baseline justify-between gap-4 text-ink/60">
                      <p>Deposit ({booking.quote.depositPercent}%)</p>
                      <p className="tnum">{formatLKR(booking.quote.depositDue)}</p>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 text-ink/60">
                      <p>Balance</p>
                      <p className="tnum">{formatLKR(Math.max(0, balance))}</p>
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <div className="flex flex-wrap gap-3 border-t border-dune pt-6">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print
              </Button>
              {!cancelled ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel booking
                </Button>
              ) : null}
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to the resort
                </Link>
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-panel border border-dune bg-dune/30 p-6">
              <Logo />
              <p className="mt-5 text-sm leading-relaxed text-ink/60">
                {resort.name}, {resort.location}.
              </p>
              <div className="mt-5 space-y-3 border-t border-ink/10 pt-4 text-sm">
                <p className="flex items-start gap-2 text-ink/60">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                  Exact arrival details are sent with your confirmation.
                </p>
                <p className="flex items-start gap-2 text-ink/60">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                  <a href={`mailto:${resort.contact.email}`} className="link-quiet break-all">
                    {resort.contact.email}
                  </a>
                </p>
              </div>
              <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/45">
                Free cancellation until {resort.stay.freeCancellationHours} hours before
                arrival. Inside that window, one night is charged.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-dune bg-salt p-6 shadow-lift sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="h3">Cancel this booking?</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-relaxed text-ink/60">
                  This releases the rooms for the dates shown. The cancellation policy
                  applies: free until {resort.stay.freeCancellationHours} hours before
                  arrival; inside that window, one night is charged.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 hover:bg-dune"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {cancelError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {cancelError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="secondary">Keep the booking</Button>
              </Dialog.Close>
              <Button variant="destructive" onClick={cancel} disabled={cancelling}>
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cancelling…
                  </>
                ) : (
                  "Cancel booking"
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
