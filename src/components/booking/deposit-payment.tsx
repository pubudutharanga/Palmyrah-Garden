"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recallBooking } from "@/lib/booking-session";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { formatDateRange } from "@/lib/dates";
import { formatLKR } from "@/lib/money";
import type { BookingRecord } from "@/lib/types";
import { resort } from "@/content/resort";

export function DepositPayment({
  reference,
  token,
  initial,
  serverError,
}: {
  reference: string;
  token: string | null;
  initial: BookingRecord | null;
  serverError: string | null;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingRecord | null>(initial);
  const [accessToken, setAccessToken] = useState<string | null>(token);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  async function pay() {    if (!accessToken) {
      setError("This link is missing its access key. Contact us and we will help.");
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const updated = await apiRequest<BookingRecord>(
        `/api/v1/bookings/${reference}/pay?t=${encodeURIComponent(accessToken)}`,
        { method: "POST", body: JSON.stringify({ method: "card" }) },
      );
      setBooking(updated);
      toast.success("The demonstration deposit has been recorded.");
      router.push(
        `/booking/${reference}?t=${encodeURIComponent(accessToken)}&paid=1`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "The payment could not be recorded. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  }

  function restoreFromBrowser() {
    const cached = recallBooking(reference);
    if (!cached) {
      setError("No demo booking for that reference was found in this browser.");
      return;
    }
    setBooking(cached.booking);
    setAccessToken((current) => cached.token ?? current);
    setRestored(true);
  }

  if (!booking) {
    return (
      <div className="shell pb-24 pt-12 md:pt-16">
        <div className="max-w-2xl">
          <p className="text-sm text-gulf">Deposit</p>
          <h1 className="h1 mt-3">We could not open this payment.</h1>
          <p className="mt-4 text-ink/65">
            {serverError ??
              "The link is incomplete or has expired. Use the full link from your booking confirmation."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/booking/${reference}${token ? `?t=${encodeURIComponent(token)}` : ""}`}>
                Back to the booking
              </Link>
            </Button>
            <Button variant="secondary" onClick={restoreFromBrowser}>
              Restore demo booking
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact">Contact the resort</Link>
            </Button>
          </div>
          {error ? (
            <p className="mt-4 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <div className="shell pb-24 pt-12 md:pt-16">
        <div className="max-w-2xl">
          <p className="text-sm text-gulf">Deposit</p>
          <h1 className="h1 mt-3">This booking is cancelled.</h1>
          <p className="mt-4 text-ink/65">
            No payment is due. If this was not intended, contact us with reference{" "}
            <span className="tnum">{reference}</span>.
          </p>
          <Button asChild className="mt-7">
            <Link href={`/booking/${reference}?t=${encodeURIComponent(accessToken ?? "")}`}>
              View the booking
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-24 pt-10 md:pt-14">
      <Link
        href={`/booking/${reference}?t=${encodeURIComponent(accessToken ?? "")}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to the booking
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <p className="text-sm text-gulf">Deposit payment</p>
          <h1 className="display-lg mt-4">A demonstration payment.</h1>
          <p className="mt-5 max-w-xl text-ink/65">
            This prototype does not connect to a payment provider and does not ask for
            card details. Pressing the button records the deposit as paid so the rest of
            the booking flow can be reviewed.
          </p>

          <div className="mt-8 rounded-panel border border-dune bg-dune/30 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                  Booking {reference}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  {formatDateRange(booking.checkIn, booking.checkOut)}
                </p>
              </div>
              <Badge tone="held">Demo payment</Badge>
            </div>

            {booking.payment.method !== "deposit" ? (
              <div className="mt-8 rounded-input border border-frond/30 bg-frond/[0.06] p-5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Check className="h-4 w-4 text-frond" aria-hidden="true" />
                  No online payment was selected
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  This booking is set to pay at the resort. The full amount is due on
                  arrival.
                </p>
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link
                    href={`/booking/${reference}?t=${encodeURIComponent(
                      accessToken ?? "",
                    )}`}
                  >
                    View the booking
                  </Link>
                </Button>
              </div>
            ) : booking.payment.depositPaid ? (
              <div className="mt-8 rounded-input border border-frond/30 bg-frond/[0.06] p-5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Check className="h-4 w-4 text-frond" aria-hidden="true" />
                  Deposit already recorded
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  The balance of{" "}
                  <span className="tnum font-medium text-ink">
                    {formatLKR(booking.quote.total - booking.quote.depositDue)}
                  </span>{" "}
                  is payable on arrival.
                </p>
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link
                    href={`/booking/${reference}?t=${encodeURIComponent(
                      accessToken ?? "",
                    )}`}
                  >
                    View the booking
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-8 border-y border-ink/10 py-6">
                  <p className="text-xs text-ink/45">Deposit due now</p>
                  <p className="tnum mt-1 font-display text-4xl tracking-[-0.02em]">
                    {formatLKR(booking.quote.depositDue)}
                  </p>
                  <p className="mt-2 text-xs text-ink/45">
                    {booking.quote.depositPercent}% of the total. The balance of{" "}
                    {formatLKR(booking.quote.total - booking.quote.depositDue)} is
                    payable at the resort.
                  </p>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-input border border-dune bg-salt px-4 py-3 text-xs leading-relaxed text-ink/55">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                  No card details are collected on this page. In production this button
                  would hand off to the resort&apos;s reviewed payment provider.
                </div>

                {error ? (
                  <p className="mt-4 text-sm text-danger" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  size="lg"
                  className="mt-6 w-full"
                  onClick={pay}
                  disabled={paying}
                >
                  {paying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Recording…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      Pay {formatLKR(booking.quote.depositDue)} (demo)
                    </>
                  )}
                </Button>
                <p className="mt-3 text-center text-[11px] text-ink/40">
                  Prototype payment. Nothing is charged.
                </p>
              </>
            )}
          </div>

          {restored ? (
            <p className="mt-4 text-xs text-ink/45">
              This booking was restored from this browser for the demo.
            </p>
          ) : null}
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="rounded-panel border border-dune p-6">
            <h2 className="h3">Before you pay</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/60">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                Free cancellation until {resort.stay.freeCancellationHours} hours before
                arrival.
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                The balance is payable at the resort.
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-frond" aria-hidden="true" />
                Keep your booking reference {reference}.
              </li>
            </ul>
            <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/45">
              Questions? Email{" "}
              <a href={`mailto:${resort.contact.email}`} className="link-quiet break-all">
                {resort.contact.email}
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
