"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { PeriodControl } from "@/components/board/period-control";
import { RoomBoard } from "@/components/board/room-board";
import { StatusLegend } from "@/components/board/status-legend";
import { RoomDrawer } from "@/components/admin/room-drawer";
import { Input } from "@/components/ui/field";
import { getBoardRoom } from "@/content/room-board";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { periodChanges, readPeriodFromQuery, updateQuery } from "@/lib/prototype/period-url";
import { getBoardPayload } from "@/lib/prototype/status";
import type { RoomBoardState } from "@/lib/prototype/types";
import { buttonClasses } from "@/components/ui/button";

export function AdminRoomBoard() {
  const state = usePrototypeState();
  const now = usePrototypeClock();
  usePrototypeExpiry(now);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<RoomBoardState | "all">("all");
  const [query, setQuery] = useState("");

  const ready = Boolean(state) && now > 0;
  const period = useMemo(
    () => (ready ? readPeriodFromQuery(searchParams, now) : null),
    [ready, searchParams, now],
  );

  const payload = useMemo(
    () =>
      state && period
        ? getBoardPayload({
            state,
            from: period.startAt,
            to: period.endAt,
            mode: "admin",
            now: new Date(now),
          })
        : null,
    [state, period, now],
  );

  const matchedRooms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || !payload) return null;
    const matches = new Set<string>();
    for (const room of payload.rooms) {
      const haystack = [
        room.roomNumber,
        room.bookingRef ?? "",
        room.guestName ?? "",
        room.status,
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(needle)) matches.add(room.roomNumber);
    }
    return matches;
  }, [payload, query]);

  const selectedNumber = searchParams.get("room");
  const selectedRoom = selectedNumber ? getBoardRoom(selectedNumber) : undefined;

  function setParams(changes: Record<string, string | null>) {
    router.replace(`${pathname}?${updateQuery(searchParams, changes)}`, {
      scroll: false,
    });
  }

  return (
    <div className="min-h-svh">
      <div className="border-b border-dune bg-salt px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="font-display text-3xl leading-none">Room board</h1>
            <p className="mt-2 text-sm text-ink/60" aria-live="polite">
              {payload
                ? `${payload.counts.available} free · ${payload.counts.pending} pending · ${payload.counts.in_house} in house · ${payload.counts.blocked} blocked`
                : "Loading the local room ledger…"}
            </p>
          </div>
          {period ? (
            <PeriodControl
              now={now}
              period={period}
              onChange={(next) => setParams(periodChanges(next))}
            />
          ) : (
            <div className="h-10 w-full max-w-xl animate-pulse rounded-full bg-dune/70" />
          )}
        </div>
      </div>

      <div className="px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {payload ? (
              <StatusLegend
                counts={payload.counts}
                mode="admin"
                active={filter}
                onChange={setFilter}
              />
            ) : null}
            {payload && payload.counts.pending > 0 ? (
              <Link
                href="/admin/bookings/pending"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Review {payload.counts.pending} pending
              </Link>
            ) : null}
          </div>

          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search rooms, guests or references</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search room, guest or PGR reference"
              className="pl-10"
            />
          </label>
        </div>

        <div className="mt-3">
          {payload ? (
            <RoomBoard
              payload={payload}
              mode="admin"
              filter={filter}
              selectedRoom={selectedRoom?.number}
              matchedRooms={matchedRooms}
              onRoomSelect={(roomNumber) => setParams({ room: roomNumber })}
            />
          ) : (
            <div className="grid grid-cols-4 border-l border-t border-ink/15 sm:grid-cols-6 lg:grid-cols-9">
              {Array.from({ length: 46 }, (_, index) => (
                <div
                  key={index}
                  className="min-h-[clamp(64px,9.5vh,96px)] animate-pulse border-b border-r border-ink/15 bg-dune/60"
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-ink/50">
          Click a room for the guest, actions and the next seven days. Status colours:
          green free, amber pending, red booked, blue in house, dark blocked.
        </p>
      </div>

      {selectedRoom && period ? (
        <RoomDrawer
          key={`${selectedRoom.number}-${period.startAt}-${period.endAt}`}
          roomNumber={selectedRoom.number}
          period={period}
          onClose={() => setParams({ room: null })}
        />
      ) : null}
    </div>
  );
}
