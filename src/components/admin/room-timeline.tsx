"use client";

import { useMemo } from "react";

import {
  addColomboDays,
  formatColomboDate,
  startOfColomboDay,
} from "@/lib/prototype/time";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import type { PrototypeState } from "@/lib/prototype/types";
import { cn } from "@/lib/utils";

const BUFFER_MS =
  PROTOTYPE_SETTINGS.stay.turnaroundMinutes * 60 * 1000;

const COLORS: Record<string, string> = {
  pending_approval: "bg-[var(--status-pending)]",
  approved: "bg-[var(--status-booked)]",
  checked_in: "bg-[var(--status-inhouse)]",
  block: "bg-[var(--status-blocked)]",
};

function barColor(status: string): string {
  return COLORS[status] ?? "bg-[var(--status-booked)]";
}

export function RoomTimeline({
  state,
  roomNumber,
  now,
}: {
  state: PrototypeState;
  roomNumber: string;
  now: number;
}) {
  const windowStart = useMemo(() => startOfColomboDay(new Date(now)), [now]);
  const windowEnd = useMemo(() => addColomboDays(windowStart, 7), [windowStart]);

  const items = useMemo(() => {
    const startMs = windowStart.getTime();
    const endMs = windowEnd.getTime();
    const total = endMs - startMs;

    const bookings = state.bookings
      .filter((booking) => booking.roomNumber === roomNumber)
      .filter((booking) =>
        ["pending_approval", "approved", "checked_in"].includes(booking.status),
      )
      .map((booking) => ({
        id: booking.id,
        status: booking.status,
        label: `${booking.ref} · ${booking.guest.name.split(" ")[0]}`,
        left: ((new Date(booking.startAt).getTime() - startMs) / total) * 100,
        width:
          ((new Date(booking.endAt).getTime() +
            BUFFER_MS -
            new Date(booking.startAt).getTime()) /
            total) *
          100,
      }));

    const blocks = state.blocks
      .filter((block) => block.roomNumber === roomNumber)
      .map((block) => ({
        id: block.id,
        status: "block",
        label: block.reason,
        left: ((new Date(block.startAt).getTime() - startMs) / total) * 100,
        width:
          ((new Date(block.endAt).getTime() - new Date(block.startAt).getTime()) /
            total) *
          100,
      }));

    return [...bookings, ...blocks]
      .map((item) => ({
        ...item,
        left: Math.max(0, Math.min(100, item.left)),
        width: Math.max(0.4, Math.min(100 - Math.max(0, item.left), item.width)),
      }))
      .sort((a, b) => a.left - b.left);
  }, [state, roomNumber, windowStart, windowEnd]);

  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.08em] text-ink/40">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index}>
            {formatColomboDate(addColomboDays(windowStart, index), {
              year: false,
              weekday: true,
            })}
          </span>
        ))}
      </div>
      <div className="relative mt-2 h-11 overflow-hidden rounded-input border border-dune bg-dune/30">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className="absolute inset-y-0 w-px bg-ink/10"
            style={{ left: `${((index + 1) / 7) * 100}%` }}
            aria-hidden="true"
          />
        ))}
        {items.map((item) => (
          <span
            key={item.id}
            title={item.label}
            className={cn(
              "absolute top-1.5 h-8 overflow-hidden rounded-sm px-1 text-[10px] leading-8 text-salt",
              barColor(item.status),
            )}
            style={{ left: `${item.left}%`, width: `${item.width}%` }}
          >
            {item.width > 14 ? item.label : ""}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink/45">
        Next 7 days. Bars include the 60-minute turnaround after a stay.
      </p>
    </div>
  );
}
