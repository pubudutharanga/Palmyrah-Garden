"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Printer, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { formatLKR } from "@/lib/money";
import { downloadCsv, toCsv } from "@/lib/prototype/csv";
import { paidFor } from "@/lib/prototype/engine";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { intervalsOverlap } from "@/lib/prototype/status";
import {
  buildColomboRange,
  colomboParts,
  formatColomboDate,
  formatColomboDateTime,
  formatColomboTime,
} from "@/lib/prototype/time";
import type { StayStatus } from "@/lib/prototype/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_ORDER: StayStatus[] = [
  "pending_approval",
  "approved",
  "checked_in",
  "checked_out",
  "rejected",
  "cancelled",
  "no_show",
  "expired",
];

const STATUS_LABEL: Record<StayStatus, string> = {
  pending_approval: "Pending",
  approved: "Approved",
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function BookingHistory() {
  const state = usePrototypeState();
  const now = usePrototypeClock(60_000);
  usePrototypeExpiry(now);

  const [yearChoice, setYearChoice] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [status, setStatus] = useState<StayStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const currentYear = now ? colomboParts(now).year : new Date().getUTCFullYear();
  const year = yearChoice ?? currentYear;

  const years = useMemo(() => {
    if (!state) return [currentYear];
    const values = new Set<number>([currentYear]);
    for (const booking of state.bookings) {
      values.add(colomboParts(booking.startAt).year);
      values.add(colomboParts(booking.createdAt).year);
    }
    return Array.from(values).sort((a, b) => b - a);
  }, [state, currentYear]);

  const range = useMemo(() => {
    try {
      return buildColomboRange({
        year,
        month: month ?? undefined,
        day: day ?? undefined,
        hour: hour ?? undefined,
      });
    } catch {
      return buildColomboRange({ year });
    }
  }, [year, month, day, hour]);

  const filtered = useMemo(() => {
    if (!state) return [];
    const needle = search.trim().toLowerCase();
    return state.bookings
      .filter((booking) => intervalsOverlap(booking, range))
      .filter((booking) => status === "all" || booking.status === status)
      .filter((booking) => {
        if (!needle) return true;
        return [
          booking.ref,
          booking.roomNumber,
          booking.guest.name,
          booking.guest.phone,
          booking.guest.email ?? "",
          booking.guest.nationality ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => b.startAt.localeCompare(a.startAt));
  }, [state, range, status, search]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (sum, booking) => {
          sum.value += booking.quote.total;
          sum.collected += paidFor(booking);
          sum.balance += Math.max(0, booking.quote.total - paidFor(booking));
          return sum;
        },
        { value: 0, collected: 0, balance: 0 },
      ),
    [filtered],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const rangeLabel = `${formatColomboDateTime(range.startAt)} to ${formatColomboDateTime(
    range.endAt,
  )}`;

  function resetPaging() {
    setPage(0);
  }

  function exportCsv() {
    const rows = filtered.map((booking) => [
      booking.ref,
      booking.status,
      booking.guest.name,
      booking.guest.phone,
      booking.guest.email ?? "",
      booking.guest.nationality ?? "",
      booking.roomNumber,
      booking.startAt,
      booking.endAt,
      booking.quote.durationLabel,
      booking.guests.adults,
      booking.guests.children,
      booking.quote.total,
      paidFor(booking),
      Math.max(0, booking.quote.total - paidFor(booking)),
      booking.createdAt,
      booking.checkedInAt ?? "",
      booking.checkedOutAt ?? "",
      booking.documents.map((document) => document.number).join(" | "),
      booking.unsettledReason ?? "",
    ]);
    const csv = toCsv(
      [
        "Reference",
        "Status",
        "Guest",
        "Phone",
        "Email",
        "Nationality",
        "Room",
        "Start (UTC ISO)",
        "End (UTC ISO)",
        "Duration",
        "Adults",
        "Children",
        "Total (minor units)",
        "Paid (minor units)",
        "Balance (minor units)",
        "Requested at",
        "Checked in at",
        "Checked out at",
        "Documents",
        "Unsettled reason",
      ],
      rows,
    );
    downloadCsv(`palmyrah-bookings-${range.startAt.slice(0, 10)}.csv`, csv);
  }

  if (!state || now === 0) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-dune/70" />
        <div className="mt-6 h-[55vh] animate-pulse rounded-panel bg-dune/50" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-[92rem]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gulf">Counter records</p>
            <h1 className="h1 mt-2">Booking history</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Filter by year, month, day or hour. Stays that overlap the selected
              window are included. Totals are for the filtered set.
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export CSV
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Print
            </Button>
          </div>
        </div>

        <div className="no-print mt-6 rounded-panel border border-dune bg-salt p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <label className="text-xs text-ink/60">
              Year
              <Select
                value={year}
                onChange={(event) => {
                  setYearChoice(Number(event.target.value));
                  setMonth(null);
                  setDay(null);
                  setHour(null);
                  resetPaging();
                }}
                className="mt-1"
              >
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </label>
            <label className="text-xs text-ink/60">
              Month
              <Select
                value={month ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setMonth(value ? Number(value) : null);
                  setDay(null);
                  setHour(null);
                  resetPaging();
                }}
                className="mt-1"
              >
                <option value="">All months</option>
                {MONTHS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="text-xs text-ink/60">
              Day
              <Select
                value={month ? (day ?? "") : ""}
                disabled={!month}
                onChange={(event) => {
                  const value = event.target.value;
                  setDay(value ? Number(value) : null);
                  setHour(null);
                  resetPaging();
                }}
                className="mt-1"
              >
                <option value="">All days</option>
                {month
                  ? Array.from({ length: daysInMonth(year, month) }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))
                  : null}
              </Select>
            </label>
            <label className="text-xs text-ink/60">
              Hour
              <Select
                value={day ? (hour ?? "") : ""}
                disabled={!day}
                onChange={(event) => {
                  const value = event.target.value;
                  setHour(value === "" ? null : Number(value));
                  resetPaging();
                }}
                className="mt-1"
              >
                <option value="">All hours</option>
                {day
                  ? Array.from({ length: 24 }, (_, index) => (
                      <option key={index} value={index}>
                        {String(index).padStart(2, "0")}:00–{String(index).padStart(2, "0")}:59
                      </option>
                    ))
                  : null}
              </Select>
            </label>
            <label className="text-xs text-ink/60">
              Status
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as StayStatus | "all");
                  resetPaging();
                }}
                className="mt-1"
              >
                <option value="all">All statuses</option>
                {STATUS_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="relative text-xs text-ink/60">
              Search
              <Search
                className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-ink/40"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPaging();
                }}
                placeholder="Guest, phone or ref"
                className="mt-1 pl-9"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Exact window: <span className="tnum">{rangeLabel}</span>
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-panel border border-dune bg-salt p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Bookings</p>
            <p className="tnum mt-1 font-display text-3xl">{filtered.length}</p>
          </div>
          <div className="rounded-panel border border-dune bg-salt p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Booking value</p>
            <p className="tnum mt-1 font-display text-2xl">{formatLKR(totals.value)}</p>
          </div>
          <div className="rounded-panel border border-dune bg-salt p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Collected</p>
            <p className="tnum mt-1 font-display text-2xl">{formatLKR(totals.collected)}</p>
          </div>
          <div className="rounded-panel border border-dune bg-salt p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Outstanding</p>
            <p className="tnum mt-1 font-display text-2xl">{formatLKR(totals.balance)}</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-panel border border-dune bg-dune/30 p-10 text-center">
            <p className="font-display text-2xl">Nothing in this window.</p>
            <p className="mt-2 text-sm text-ink/60">
              Widen the filters or clear the search.
            </p>
          </div>
        ) : (
          <>
            <div className="no-print mt-6 overflow-x-auto rounded-panel border border-dune bg-salt">
              <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
                <thead className="bg-dune/50 text-xs uppercase tracking-[0.08em] text-ink/55">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Reference</th>
                    <th className="px-3 py-2.5 font-semibold">Guest</th>
                    <th className="px-3 py-2.5 font-semibold">Room</th>
                    <th className="px-3 py-2.5 font-semibold">Stay</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Paid</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Balance</th>
                    <th className="px-3 py-2.5 font-semibold">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((booking) => (
                    <tr key={booking.id} className="border-t border-dune align-top">
                      <td className="tnum px-3 py-3 font-medium">{booking.ref}</td>
                      <td className="px-3 py-3">
                        <p>{booking.guest.name}</p>
                        <p className="text-xs text-ink/50">{booking.guest.phone}</p>
                      </td>
                      <td className="tnum px-3 py-3">{booking.roomNumber}</td>
                      <td className="px-3 py-3">
                        <p>{formatColomboDateTime(booking.startAt)}</p>
                        <p className="text-xs text-ink/50">
                          to {formatColomboDateTime(booking.endAt)} ·{" "}
                          {booking.quote.durationLabel}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={STATUS_TONE[booking.status]}>
                          {STATUS_LABEL[booking.status]}
                        </Badge>
                      </td>
                      <td className="tnum px-3 py-3 text-right">
                        {formatLKR(booking.quote.total)}
                      </td>
                      <td className="tnum px-3 py-3 text-right">
                        {formatLKR(paidFor(booking))}
                      </td>
                      <td className="tnum px-3 py-3 text-right">
                        {formatLKR(
                          Math.max(0, booking.quote.total - paidFor(booking)),
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/front-desk/check-out/${booking.ref}`}
                          className="link-quiet text-xs"
                        >
                          Folio
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-ink/55">
                Showing {safePage * PAGE_SIZE + 1}–
                {Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  Previous
                </Button>
                <span className="tnum text-xs text-ink/55">
                  {safePage + 1} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="hidden print:block">
          <div className="mb-4 border-b border-ink/30 pb-3">
            <p className="font-display text-2xl">The Palmyrah Garden &amp; Resort</p>
            <p className="mt-1 font-semibold">Booking history</p>
            <p className="text-sm">{rangeLabel}</p>
            <p className="text-sm">
              {filtered.length} bookings · value {formatLKR(totals.value)} · collected{" "}
              {formatLKR(totals.collected)} · outstanding {formatLKR(totals.balance)}
            </p>
          </div>
          <table className="w-full border-collapse text-left text-[9pt]">
            <thead>
              <tr className="border-b border-ink/40">
                <th className="py-1 pr-2">Ref</th>
                <th className="py-1 pr-2">Guest</th>
                <th className="py-1 pr-2">Room</th>
                <th className="py-1 pr-2">Stay</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 text-right">Total</th>
                <th className="py-1 text-right">Paid</th>
                <th className="py-1 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-ink/15">
                  <td className="tnum py-1 pr-2">{booking.ref}</td>
                  <td className="py-1 pr-2">{booking.guest.name}</td>
                  <td className="tnum py-1 pr-2">{booking.roomNumber}</td>
                  <td className="py-1 pr-2">
                    {formatColomboDate(booking.startAt)} {formatColomboTime(booking.startAt)} –{" "}
                    {formatColomboDate(booking.endAt)} {formatColomboTime(booking.endAt)}
                  </td>
                  <td className="py-1 pr-2">{STATUS_LABEL[booking.status]}</td>
                  <td className="tnum py-1 text-right">{formatLKR(booking.quote.total)}</td>
                  <td className="tnum py-1 text-right">{formatLKR(paidFor(booking))}</td>
                  <td className="tnum py-1 text-right">
                    {formatLKR(Math.max(0, booking.quote.total - paidFor(booking)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[8pt] text-ink/60">
            Printed {formatColomboDateTime(new Date(now))} · sample prototype data —
            TODO(client).
          </p>
        </div>

        <p className={cn("no-print mt-4 text-xs text-ink/45")}>
          CSV values in minor units; timestamps in UTC ISO. Printed and on-screen
          totals use LKR.
        </p>
      </div>
    </div>
  );
}
