import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import type {
  BoardPayload,
  BoardRoomStatus,
  GuestVisibleState,
  PrototypeBooking,
  PrototypeState,
  RoomBoardState,
  RoomBlock,
} from "@/lib/prototype/types";
import { formatColomboDateTime, formatColomboTime, formatExpiryRelative } from "@/lib/prototype/time";
import { getRoomCategoryId, BOARD_ROOMS } from "@/content/room-board";

type Interval = { start: number; end: number; startIso: string; endIso: string };
type Candidate = {
  status: RoomBoardState;
  booking?: PrototypeBooking;
  block?: RoomBlock;
  interval: Interval;
  priority: number;
};

const PRIORITY: Record<RoomBoardState, number> = {
  available: 0,
  blocked: 1,
  pending: 2,
  booked: 3,
  in_house: 4,
};

const BUFFER_MS = PROTOTYPE_SETTINGS.stay.turnaroundMinutes * 60 * 1000;

export function isPendingExpired(booking: PrototypeBooking, now: Date | string): boolean {
  return (
    booking.status === "pending_approval" &&
    Boolean(booking.pendingExpiresAt) &&
    new Date(booking.pendingExpiresAt as string).getTime() <= new Date(now).getTime()
  );
}

export function isBookingOccupying(
  booking: PrototypeBooking,
  now: Date | string,
): boolean {
  if (booking.status === "approved" || booking.status === "checked_in") return true;
  if (booking.status === "pending_approval") return !isPendingExpired(booking, now);
  return false;
}

export function bookingInterval(booking: PrototypeBooking): Interval {
  const start = new Date(booking.startAt).getTime();
  const rawEnd = new Date(booking.endAt).getTime();
  return {
    start,
    end: rawEnd + BUFFER_MS,
    startIso: booking.startAt,
    endIso: new Date(rawEnd + BUFFER_MS).toISOString(),
  };
}

export function blockInterval(block: RoomBlock): Interval {
  return {
    start: new Date(block.startAt).getTime(),
    end: new Date(block.endAt).getTime(),
    startIso: block.startAt,
    endIso: block.endAt,
  };
}

export function intervalsOverlap(
  a: { startAt: string; endAt: string },
  b: { startAt: string; endAt: string },
): boolean {
  return (
    new Date(a.startAt).getTime() < new Date(b.endAt).getTime() &&
    new Date(a.endAt).getTime() > new Date(b.startAt).getTime()
  );
}

function bookingCandidates(
  booking: PrototypeBooking,
  from: number,
  to: number,
  now: Date | string,
): Candidate | null {
  if (!isBookingOccupying(booking, now)) return null;
  const interval = bookingInterval(booking);
  if (!(interval.start < to && interval.end > from)) return null;
  const status: RoomBoardState =
    booking.status === "checked_in"
      ? "in_house"
      : booking.status === "approved"
        ? "booked"
        : "pending";
  return { status, booking, interval, priority: PRIORITY[status] };
}

function blockCandidates(
  block: RoomBlock,
  from: number,
  to: number,
): Candidate | null {
  const interval = blockInterval(block);
  if (!(interval.start < to && interval.end > from)) return null;
  return { status: "blocked", block, interval, priority: PRIORITY.blocked };
}

function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] || "Guest";
}

function guestCount(booking: PrototypeBooking): number {
  return booking.guests.adults + booking.guests.children;
}

function guestStatus(status: RoomBoardState): GuestVisibleState {
  if (status === "available" || status === "pending") return status;
  return "booked";
}

function availableAgain(
  roomNumber: string,
  state: PrototypeState,
  from: number,
  now: Date | string,
): string | undefined {
  const intervals = [
    ...state.bookings
      .filter((booking) => booking.roomNumber === roomNumber)
      .map((booking) => (isBookingOccupying(booking, now) ? bookingInterval(booking) : null))
      .filter((interval): interval is Interval => Boolean(interval)),
    ...state.blocks
      .filter((block) => block.roomNumber === roomNumber)
      .map(blockInterval),
  ]
    .filter((interval) => interval.end > from)
    .sort((a, b) => a.start - b.start);

  let candidate = from;
  for (let guard = 0; guard < 40; guard += 1) {
    const inside = intervals.find(
      (interval) => interval.start <= candidate && interval.end > candidate,
    );
    if (!inside) break;
    candidate = inside.end;
  }
  return new Date(candidate).toISOString();
}

function buildTooltip(
  mode: "guest" | "admin",
  roomNumber: string,
  candidate: Candidate | null,
  availableAt: string | undefined,
  now: Date | string,
): string {
  if (!candidate) {
    return `Room ${roomNumber}, free for this period.`;
  }

  if (mode === "guest") {
    if (candidate.status === "pending" && candidate.booking) {
      return `Room ${roomNumber}, requested. Awaiting confirmation.`;
    }
    if (candidate.booking) {
      return `Room ${roomNumber}, booked until ${formatColomboDateTime(
        candidate.booking.endAt,
      )}. Available again from ${formatColomboDateTime(availableAt ?? candidate.booking.endAt)}.`;
    }
    return `Room ${roomNumber}, unavailable for this period.`;
  }

  if (candidate.block) {
    return `Room ${roomNumber}, blocked. ${candidate.block.reason}. Until ${formatColomboDateTime(
      candidate.block.endAt,
    )}.`;
  }

  if (candidate.booking) {
    const booking = candidate.booking;
    const status =
      candidate.status === "in_house"
        ? "In house"
        : candidate.status === "pending"
          ? "Pending"
          : "Booked";
    const pending =
      candidate.status === "pending" && booking.pendingExpiresAt
        ? ` Awaiting approval, expires in ${formatExpiryRelative(
            booking.pendingExpiresAt,
            now,
          )}.`
        : "";
    return `${status}. ${formatColomboDateTime(
      booking.startAt,
    )} to ${formatColomboDateTime(booking.endAt)}. ${booking.ref}. ${
      booking.guest.name
    }. ${guestCount(booking)} ${guestCount(booking) === 1 ? "guest" : "guests"}.${pending}`;
  }

  return `Room ${roomNumber}, unavailable.`;
}

function buildShortLine(
  mode: "guest" | "admin",
  candidate: Candidate | null,
  availableAt: string | undefined,
): string {
  if (!candidate) return "Free";
  if (mode === "guest") {
    if (candidate.status === "pending") return "Requested";
    return `Booked until ${formatColomboTime(
      candidate.booking?.endAt ?? candidate.block?.endAt ?? availableAt ?? new Date().toISOString(),
    )}`;
  }
  if (candidate.block) return candidate.block.reason;
  if (candidate.booking) {
    const first = firstWord(candidate.booking.guest.name);
    if (candidate.status === "pending") return `${first} · awaiting`;
    return `${first} · until ${formatColomboTime(candidate.booking.endAt)}`;
  }
  return "Unavailable";
}

export function getRoomStatus(
  roomNumber: string,
  state: PrototypeState,
  from: string,
  to: string,
  now: Date | string = new Date(),
  mode: "guest" | "admin" = "guest",
): BoardRoomStatus {
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to).getTime();

  const candidates = [
    ...state.bookings
      .filter((booking) => booking.roomNumber === roomNumber)
      .map((booking) => bookingCandidates(booking, fromMs, toMs, now)),
    ...state.blocks
      .filter((block) => block.roomNumber === roomNumber)
      .map((block) => blockCandidates(block, fromMs, toMs)),
  ].filter((candidate): candidate is Candidate => Boolean(candidate));

  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.interval.start - b.interval.start;
  });

  const winner = candidates[0] ?? null;
  const rawStatus = winner?.status ?? "available";
  const status: RoomBoardState =
    mode === "guest" ? guestStatus(rawStatus) : rawStatus;

  const overlappingEnd = candidates.reduce(
    (latest, candidate) => Math.max(latest, candidate.interval.end),
    fromMs,
  );
  const availableAt =
    winner === null
      ? undefined
      : availableAgain(roomNumber, state, overlappingEnd, now);

  const base: BoardRoomStatus = {
    roomNumber,
    category: getRoomCategoryId(roomNumber),
    status,
    tooltip: buildTooltip(mode, roomNumber, winner, availableAt, now),
    shortLine: buildShortLine(mode, winner, availableAt),
    availableAgainAt: availableAt,
  };

  if (winner?.booking) {
    base.bookingStatus = winner.booking.status;
    base.startAt = winner.booking.startAt;
    base.endAt = winner.booking.endAt;
    base.pendingExpiresAt = winner.booking.pendingExpiresAt;
    if (mode === "admin") {
      base.bookingRef = winner.booking.ref;
      base.guestName = winner.booking.guest.name;
    }
  }
  if (winner?.block && mode === "admin") {
    base.startAt = winner.block.startAt;
    base.endAt = winner.block.endAt;
  }

  return base;
}

export function getBoardPayload({
  state,
  from,
  to,
  mode,
  now = new Date(),
}: {
  state: PrototypeState;
  from: string;
  to: string;
  mode: "guest" | "admin";
  now?: Date | string;
}): BoardPayload {
  const rooms = BOARD_ROOMS.map((room) =>
    getRoomStatus(room.number, state, from, to, now, mode),
  );
  const counts: Record<RoomBoardState, number> = {
    available: 0,
    pending: 0,
    booked: 0,
    in_house: 0,
    blocked: 0,
  };
  for (const room of rooms) counts[room.status] += 1;

  return { from, to, mode, counts, rooms };
}

export function getAdminRoomOverlaps(
  state: PrototypeState,
  roomNumber: string,
  from: string,
  to: string,
  now: Date | string = new Date(),
) {
  const bookings = state.bookings
    .filter(
      (booking) =>
        booking.roomNumber === roomNumber &&
        isBookingOccupying(booking, now) &&
        intervalsOverlap(booking, { startAt: from, endAt: to }),
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const blocks = state.blocks
    .filter(
      (block) =>
        block.roomNumber === roomNumber &&
        intervalsOverlap(block, { startAt: from, endAt: to }),
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  return { bookings, blocks };
}

export function statusesForRoom(
  state: PrototypeState,
  roomNumber: string,
  now: Date | string = new Date(),
): PrototypeBooking[] {
  return state.bookings
    .filter(
      (booking) =>
        booking.roomNumber === roomNumber && isBookingOccupying(booking, now),
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}
