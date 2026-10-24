"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarPlus, DoorOpen, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { BookingPanel } from "@/components/admin/booking-panel";
import { RoomTimeline } from "@/components/admin/room-timeline";
import { STATUS_META } from "@/components/board/status-meta";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { getBoardRoom, getRoomCategory } from "@/content/room-board";
import { usePrototypeClock, usePrototypeState } from "@/lib/prototype/hooks";
import { blockRoom, setHousekeeping, unblockRoom } from "@/lib/prototype/engine";
import { runPrototypeAction } from "@/lib/prototype/store";
import { getAdminRoomOverlaps, getRoomStatus } from "@/lib/prototype/status";
import { formatColomboDateTime, type Period } from "@/lib/prototype/time";
import type { PrototypeState } from "@/lib/prototype/types";
import { cn } from "@/lib/utils";

type Entry =
  | { kind: "booking"; id: string; booking: PrototypeState["bookings"][number] }
  | { kind: "block"; id: string; block: PrototypeState["blocks"][number] };

export function RoomDrawer({
  roomNumber,
  period,
  onClose,
}: {
  roomNumber: string;
  period: Period;
  onClose: () => void;
}) {
  const state = usePrototypeState();
  const now = usePrototypeClock(30_000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);

  if (!state || now === 0) return null;

  const room = getBoardRoom(roomNumber);
  if (!room) return null;

  const nowDate = new Date(now);
  const status = getRoomStatus(
    roomNumber,
    state,
    period.startAt,
    period.endAt,
    nowDate,
    "admin",
  );
  const meta = STATUS_META[status.status];
  const Icon = meta.icon;

  const overlaps = getAdminRoomOverlaps(
    state,
    roomNumber,
    period.startAt,
    period.endAt,
    nowDate,
  );
  const entries: Entry[] = [
    ...overlaps.bookings.map(
      (booking): Entry => ({ kind: "booking", id: booking.id, booking }),
    ),
    ...overlaps.blocks.map((block): Entry => ({ kind: "block", id: block.id, block })),
  ];
  const active = entries.find((entry) => entry.id === selectedId) ?? entries[0];

  function submitBlock() {
    const result = runPrototypeAction((current) =>
      blockRoom(
        current,
        {
          roomNumber,
          startAt: period.startAt,
          endAt: period.endAt,
          reason: blockReason,
        },
        new Date(now),
      ),
    );
    if (result.ok) {
      toast.success(`Room ${roomNumber} blocked.`);
      setBlockReason("");
      setBlockError(null);
    } else {
      setBlockError(result.message);
    }
  }

  function removeBlock(blockId: string) {
    const result = runPrototypeAction((current) =>
      unblockRoom(current, blockId, new Date(now)),
    );
    if (result.ok) toast.success(`Room ${roomNumber} unblocked.`);
    else toast.error(result.message);
  }

  function changeHousekeeping(value: string) {
    const result = runPrototypeAction((current) =>
      setHousekeeping(
        current,
        roomNumber,
        value as PrototypeState["housekeeping"][string],
        new Date(now),
      ),
    );
    if (!result.ok) toast.error(result.message);
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-dune bg-salt shadow-lift outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-dune px-5 py-4">
            <div>
              <Dialog.Title className="tnum font-display text-3xl leading-none">
                Room {roomNumber}
              </Dialog.Title>
              <p className="mt-1 text-sm text-ink/60">
                {room.wing} · {getRoomCategory(roomNumber)?.label ?? "Room"} ·{" "}
                {room.bedType} bed · {room.sizeSqm} m²
              </p>
              <div
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  meta.tile,
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {meta.label}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="housekeeping">
                Housekeeping
              </label>
              <Select
                id="housekeeping"
                value={state.housekeeping[roomNumber] ?? "clean"}
                onChange={(event) => changeHousekeeping(event.target.value)}
                className="h-10 min-h-10 w-36 py-0 text-xs capitalize"
              >
                <option value="clean">Clean</option>
                <option value="dirty">Dirty</option>
                <option value="inspected">Inspected</option>
              </Select>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-dune"
                  aria-label="Close room drawer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="text-xs text-ink/50">
              Board window: {formatColomboDateTime(period.startAt)} to{" "}
              {formatColomboDateTime(period.endAt)}
            </p>

            {entries.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Overlapping stays">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={active?.id === entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      active?.id === entry.id
                        ? "border-ink bg-ink text-salt"
                        : "border-ink/15 bg-salt text-ink/70 hover:border-ink/35",
                    )}
                  >
                    {entry.kind === "booking"
                      ? `${entry.booking.ref} · ${entry.booking.guest.name.split(" ")[0]}`
                      : `Block · ${entry.block.reason}`}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              {active?.kind === "booking" ? (
                <BookingPanel key={active.id} booking={active.booking} now={now} />
              ) : active?.kind === "block" ? (
                <div className="space-y-4 rounded-panel border border-dune p-4">
                  <p className="flex items-center gap-2 font-medium">
                    <Wrench className="h-4 w-4 text-frond" aria-hidden="true" />
                    {active.block.reason}
                  </p>
                  <p className="text-sm text-ink/65">
                    Blocked {formatColomboDateTime(active.block.startAt)} to{" "}
                    {formatColomboDateTime(active.block.endAt)}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeBlock(active.block.id)}
                  >
                    Unblock this window
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 rounded-panel border border-dune p-4">
                  <p className="flex items-center gap-2 font-medium">
                    <DoorOpen className="h-4 w-4 text-frond" aria-hidden="true" />
                    Free for this window
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/book?room=${roomNumber}&from=${encodeURIComponent(
                        period.startAt,
                      )}&to=${encodeURIComponent(period.endAt)}`}
                      className={buttonClasses({ size: "sm" })}
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      New walk-in request
                    </Link>
                  </div>

                  <div className="space-y-2 border-t border-dune pt-4">
                    <label htmlFor="block-reason" className="text-sm font-medium">
                      Block this room for the board window
                    </label>
                    <Input
                      id="block-reason"
                      value={blockReason}
                      onChange={(event) => setBlockReason(event.target.value)}
                      placeholder="Maintenance, deep clean, hold for owner…"
                    />
                    {blockError ? (
                      <p className="text-sm text-danger" role="alert">
                        {blockError}
                      </p>
                    ) : null}
                    <Button type="button" variant="secondary" size="sm" onClick={submitBlock}>
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                      Block window
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-dune pt-5">
              <h3 className="text-sm font-semibold">Room timeline</h3>
              <div className="mt-3">
                <RoomTimeline state={state} roomNumber={roomNumber} now={now} />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
