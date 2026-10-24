"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { GuestRoomDialog } from "@/components/board/guest-room-dialog";
import { PeriodControl } from "@/components/board/period-control";
import { RoomBoard } from "@/components/board/room-board";
import { StatusLegend } from "@/components/board/status-legend";
import { getBoardRoom, isRoomCategoryId, ROOM_CATEGORIES } from "@/content/room-board";
import { usePrototypeClock, usePrototypeExpiry, usePrototypeState } from "@/lib/prototype/hooks";
import { periodChanges, readPeriodFromQuery, updateQuery } from "@/lib/prototype/period-url";
import { getBoardPayload } from "@/lib/prototype/status";
import type { RoomBoardState } from "@/lib/prototype/types";
import { BOARD_ROOM_COUNT, BOARD_ROOM_COUNTS } from "@/content/room-board";
import { cn } from "@/lib/utils";

function BoardSkeleton() {
  return (
    <div
      className="grid grid-cols-4 border-l border-t border-ink/15 sm:grid-cols-6 lg:grid-cols-9"
      aria-hidden="true"
    >
      {Array.from({ length: 46 }, (_, index) => (
        <div
          key={index}
          className="min-h-[clamp(64px,9.5vh,96px)] animate-pulse border-b border-r border-ink/15 bg-dune/60 p-2"
        />
      ))}
    </div>
  );
}

export function GuestRoomBoard() {
  const state = usePrototypeState();
  const now = usePrototypeClock();
  usePrototypeExpiry(now);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<RoomBoardState | "all">("all");

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
            mode: "guest",
            now: new Date(now),
          })
        : null,
    [state, period, now],
  );

  const selectedNumber = searchParams.get("room");
  const selectedRoom = selectedNumber ? getBoardRoom(selectedNumber) : undefined;
  const selectedStatus =
    payload && selectedRoom
      ? payload.rooms.find((room) => room.roomNumber === selectedRoom.number)
      : undefined;

  const categoryParam = searchParams.get("category");
  const categoryFilter = isRoomCategoryId(categoryParam) ? categoryParam : "all";

  function setParams(changes: Record<string, string | null>) {
    router.replace(`${pathname}?${updateQuery(searchParams, changes)}`, {
      scroll: false,
    });
  }

  return (
    <div className="min-h-svh pt-20">
      <div className="border-b border-dune bg-salt">
        <div className="shell flex flex-col gap-3 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="font-display text-2xl leading-none">The room board</h1>
            <p className="mt-1 text-xs text-ink/55">
              {BOARD_ROOM_COUNT} rooms · AC and non-AC · pick a window to see what is
              free
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

      <div className="shell py-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={categoryFilter === "all"}
            onClick={() =>
              setParams({ category: categoryFilter === "all" ? null : "all" })
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              categoryFilter === "all"
                ? "border-ink bg-ink text-salt"
                : "border-ink/15 bg-salt text-ink/70 hover:border-ink/35",
            )}
          >
            All rooms ({BOARD_ROOM_COUNT})
          </button>
          {ROOM_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={categoryFilter === category.id}
              onClick={() =>
                setParams({
                  category: categoryFilter === category.id ? null : category.id,
                })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === category.id
                  ? "border-ink bg-ink text-salt"
                  : "border-ink/15 bg-salt text-ink/70 hover:border-ink/35",
              )}
            >
              {category.label} ({BOARD_ROOM_COUNTS[category.id]})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {payload ? (
            <StatusLegend
              counts={payload.counts}
              mode="guest"
              active={filter}
              onChange={setFilter}
            />
          ) : (
            <div className="h-9 w-72 animate-pulse rounded-full bg-dune/70" />
          )}
          <p className="text-sm text-ink/60" aria-live="polite">
            {payload
              ? `${payload.counts.available} of ${BOARD_ROOM_COUNT} rooms are free for this window`
              : "Reading the local booking ledger…"}
          </p>
        </div>

        <div className="mt-3">
          {payload ? (
            <RoomBoard
              payload={payload}
              mode="guest"
              filter={filter}
              category={categoryFilter}
              selectedRoom={selectedRoom?.number}
              onRoomSelect={(roomNumber) => setParams({ room: roomNumber })}
            />
          ) : (
            <BoardSkeleton />
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/50">
          <p>
            Status colours: green free, amber requested, red booked. A booking holds
            the room for a 60-minute turnaround after checkout.
          </p>
          <p className="tnum">Updated every 15 seconds</p>
        </div>
      </div>

      {selectedRoom && selectedStatus && period ? (
        <GuestRoomDialog
          key={`${selectedRoom.number}-${period.startAt}-${period.endAt}`}
          room={selectedRoom}
          status={selectedStatus}
          period={period}
          now={now}
          onClose={() => setParams({ room: null })}
          onShowFree={() => {
            setFilter("available");
            setParams({ room: null });
          }}
        />
      ) : null}
    </div>
  );
}
