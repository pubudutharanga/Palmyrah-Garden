"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { STATUS_META } from "@/components/board/status-meta";
import { ROOM_CATEGORY_BY_ID } from "@/content/room-board";
import type { RoomCategoryId } from "@/content/room-board";
import { cn } from "@/lib/utils";
import type { BoardPayload, BoardRoomStatus, RoomBoardState } from "@/lib/prototype/types";

type BoardFilter = RoomBoardState | "all";
export type BoardCategoryFilter = RoomCategoryId | "all";

function columnsForWidth(width: number): number {
  if (width >= 1024) return 9;
  if (width >= 640) return 6;
  return 4;
}

export function RoomBoard({
  payload,
  mode,
  filter = "all",
  category = "all",
  onRoomSelect,
  selectedRoom,
  matchedRooms,
  className,
}: {
  payload: BoardPayload;
  mode: "guest" | "admin";
  filter?: BoardFilter;
  category?: BoardCategoryFilter;
  onRoomSelect: (roomNumber: string) => void;
  selectedRoom?: string | null;
  matchedRooms?: Set<string> | null;
  className?: string;
}) {
  const rooms = payload.rooms;
  const [columns, setColumns] = useState(() =>
    typeof window === "undefined" ? 9 : columnsForWidth(window.innerWidth),
  );
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const update = () => setColumns(columnsForWidth(window.innerWidth));
    const small = window.matchMedia("(max-width: 639px)");
    const medium = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");
    small.addEventListener("change", update);
    medium.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      medium.removeEventListener("change", update);
    };
  }, []);

  function isShown(room: BoardRoomStatus): boolean {
    if (filter !== "all" && room.status !== filter) return false;
    if (category !== "all" && room.category !== category) return false;
    if (matchedRooms && !matchedRooms.has(room.roomNumber)) return false;
    return true;
  }

  function focusRoom(index: number) {
    if (rooms.length === 0) return;
    const clamped = Math.max(0, Math.min(rooms.length - 1, index));
    setFocusIndex(clamped);
    refs.current[clamped]?.focus();
  }

  function moveFocus(from: number, delta: number) {
    let index = from + delta;
    while (index >= 0 && index < rooms.length) {
      if (isShown(rooms[index])) {
        focusRoom(index);
        return;
      }
      index += delta > 0 ? 1 : -1;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(index, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(index, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(index, columns);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(index, -columns);
        break;
      case "Home":
        event.preventDefault();
        focusRoom(0);
        break;
      case "End":
        event.preventDefault();
        focusRoom(rooms.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="grid"
      aria-label={mode === "guest" ? "Room availability" : "Admin room board"}
      className={cn(
        "grid grid-cols-4 border-l border-t border-ink/15 bg-salt sm:grid-cols-6 lg:grid-cols-9",
        className,
      )}
    >
      {rooms.map((room, index) => {
        const meta = STATUS_META[room.status];
        const Icon = meta.icon;
        const dimmed = !isShown(room);
        return (
          <button
            key={room.roomNumber}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="gridcell"
            data-status={room.status}
            data-room-index={index}
            data-selected={selectedRoom === room.roomNumber ? "true" : undefined}
            aria-label={`Room ${room.roomNumber}, ${
              ROOM_CATEGORY_BY_ID.get(room.category ?? "non_ac")?.label
            }, ${meta.label}. ${room.tooltip}`}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => onRoomSelect(room.roomNumber)}
            onFocus={() => setFocusIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "group relative flex min-h-[clamp(64px,9.5vh,96px)] flex-col justify-between border-b border-r border-ink/15 p-2 text-left transition-[filter,opacity] duration-200 focus-visible:z-20",
              meta.tile,
              dimmed && "opacity-30 grayscale-[0.2]",
              selectedRoom === room.roomNumber && "ring-2 ring-inset ring-ink",
            )}
          >
            <span className="status-pattern" aria-hidden="true" />
            <span className="relative flex items-start justify-between gap-1">
              <span className="flex flex-col items-start gap-1">
                <span className="tnum font-display text-[clamp(1.35rem,2.6vh,1.8rem)] leading-none">
                  {room.roomNumber}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-[0.06em]",
                    room.status === "available" || room.status === "pending"
                      ? "bg-ink/10 text-ink"
                      : "bg-salt/20 text-salt",
                  )}
                >
                  {ROOM_CATEGORY_BY_ID.get(room.category ?? "non_ac")?.shortLabel}
                </span>
              </span>
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
            </span>
            <span className="relative block min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em]">
                {meta.label}
              </span>
              <span className="block truncate text-[11px] leading-snug opacity-85">
                {room.shortLine}
              </span>
            </span>

            <span
              role="tooltip"
              className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-1 rounded-input border border-dune bg-ink p-3 text-left text-xs font-normal leading-relaxed text-salt opacity-0 shadow-lift transition-[opacity,visibility] duration-150 delay-150 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
            >
              {room.tooltip}
            </span>
          </button>
        );
      })}
    </div>
  );
}
