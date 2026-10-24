import { isRoomNumber } from "@/content/room-board";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import { quoteInterval, validateWindow } from "@/lib/prototype/pricing";
import type {
  DocumentSnapshot,
  DocumentType,
  PaymentMethod,
  PrototypeBooking,
  PrototypeDocument,
  PrototypeState,
  RoomBlock,
  StayStatus,
} from "@/lib/prototype/types";
import { intervalsOverlap, isBookingOccupying, isPendingExpired } from "@/lib/prototype/status";
import { colomboParts, formatColomboDateTime } from "@/lib/prototype/time";
import { resort } from "@/content/resort";

export type EngineError = {
  ok: false;
  code:
    | "VALIDATION_ERROR"
    | "ROOM_UNAVAILABLE"
    | "INVALID_STATE"
    | "HOLD_EXPIRED"
    | "NOT_FOUND"
    | "LIMIT_REACHED"
    | "PAYMENT_ERROR";
  message: string;
};

export type EngineSuccess<T> = {
  ok: true;
  state: PrototypeState;
  data: T;
};

export type EngineResult<T> = EngineSuccess<T> | EngineError;

const BUFFER_MS = PROTOTYPE_SETTINGS.stay.turnaroundMinutes * 60 * 1000;

function success<T>(state: PrototypeState, data: T): EngineSuccess<T> {
  return { ok: true, state, data };
}

function failure(
  code: EngineError["code"],
  message: string,
): EngineError {
  return { ok: false, code, message };
}

function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

function audit(
  state: PrototypeState,
  action: string,
  input: { ref?: string; roomNumber?: string; detail?: string },
  at: string,
): PrototypeState {
  return {
    ...state,
    audit: [
      {
        id: newId("audit"),
        at,
        action,
        ref: input.ref,
        roomNumber: input.roomNumber,
        detail: input.detail,
      },
      ...state.audit,
    ].slice(0, 300),
  };
}

function outbox(
  state: PrototypeState,
  booking: PrototypeBooking,
  at: string,
): PrototypeState {
  return {
    ...state,
    outbox: [
      {
        id: newId("msg"),
        channel: "whatsapp" as const,
        to: "admin",
        template: "new_booking_alert",
        ref: booking.ref,
        status: "logged" as const,
        createdAt: at,
      },
      ...state.outbox,
    ].slice(0, 100),
  };
}

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateBookingRef(state: PrototypeState): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let suffix = "";
    const bytes =
      typeof crypto !== "undefined" && "getRandomValues" in crypto
        ? crypto.getRandomValues(new Uint8Array(6))
        : Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
    for (const byte of bytes) suffix += REF_ALPHABET[byte % REF_ALPHABET.length];
    const ref = `PGR-${suffix}`;
    if (!state.bookings.some((booking) => booking.ref === ref)) return ref;
  }
  return `PGR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function newBookingId(): string {
  return newId("booking");
}

export function findBooking(
  state: PrototypeState,
  ref: string,
): PrototypeBooking | undefined {
  return state.bookings.find((booking) => booking.ref === ref);
}

function replaceBooking(
  state: PrototypeState,
  booking: PrototypeBooking,
): PrototypeState {
  return {
    ...state,
    bookings: state.bookings.map((item) =>
      item.ref === booking.ref ? booking : item,
    ),
  };
}

function roomConflict(
  state: PrototypeState,
  roomNumber: string,
  startAt: string,
  endAt: string,
  now: Date | string,
  excludeRef?: string,
): PrototypeBooking | RoomBlock | null {
  const candidate = {
    startAt,
    endAt: new Date(new Date(endAt).getTime() + BUFFER_MS).toISOString(),
  };

  for (const booking of state.bookings) {
    if (booking.ref === excludeRef) continue;
    if (!isBookingOccupying(booking, now)) continue;
    if (booking.roomNumber !== roomNumber) continue;
    const existing = {
      startAt: booking.startAt,
      endAt: new Date(
        new Date(booking.endAt).getTime() + BUFFER_MS,
      ).toISOString(),
    };
    if (intervalsOverlap(existing, candidate)) return booking;
  }
  for (const block of state.blocks) {
    if (block.roomNumber !== roomNumber) continue;
    if (intervalsOverlap(block, candidate)) return block;
  }
  return null;
}

function activePendingForPhone(
  state: PrototypeState,
  phone: string,
  now: Date | string,
): number {
  const normalized = normalizePhone(phone);
  return state.bookings.filter(
    (booking) =>
      booking.status === "pending_approval" &&
      !isPendingExpired(booking, now) &&
      normalizePhone(booking.guest.phone) === normalized,
  ).length;
}

export type CreateRequestInput = {
  roomNumber: string;
  startAt: string;
  endAt: string;
  adults: number;
  children: number;
  guest: {
    name: string;
    phone: string;
    email?: string;
    nationality?: string;
    address?: string;
    vehicleNumber?: string;
    notes?: string;
  };
  idempotencyKey?: string;
};

export function createBookingRequest(
  state: PrototypeState,
  input: CreateRequestInput,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const now = new Date(nowValue);
  const nowIso = now.toISOString();

  if (input.idempotencyKey) {
    const existing = state.bookings.find(
      (booking) => booking.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return success(state, { booking: existing });
  }

  if (!isRoomNumber(input.roomNumber)) {
    return failure("VALIDATION_ERROR", "Choose a room from the board.");
  }
  if (
    !Number.isInteger(input.adults) ||
    input.adults < 1 ||
    input.adults > 2 ||
    !Number.isInteger(input.children) ||
    input.children < 0 ||
    input.children > 1
  ) {
    return failure(
      "VALIDATION_ERROR",
      "Each room sleeps up to 2 adults and 1 child.",
    );
  }
  if (input.guest.name.trim().length < 2) {
    return failure("VALIDATION_ERROR", "Enter the guest's full name.");
  }
  if (normalizePhone(input.guest.phone).length < 7) {
    return failure("VALIDATION_ERROR", "Enter a phone number with country code.");
  }

  const validation = validateWindow(
    { startAt: input.startAt, endAt: input.endAt },
    now,
  );
  if (!validation.ok) return failure("VALIDATION_ERROR", validation.message);

  if (
    activePendingForPhone(state, input.guest.phone, now) >=
    PROTOTYPE_SETTINGS.stay.maxPendingPerPhone
  ) {
    return failure(
      "LIMIT_REACHED",
      "This phone number already has two requests waiting for approval. Please wait for the resort to reply.",
    );
  }

  const conflict = roomConflict(
    state,
    input.roomNumber,
    validation.startAt,
    validation.endAt,
    now,
  );
  if (conflict) {
    return failure(
      "ROOM_UNAVAILABLE",
      "That room was just taken for these times. Choose another room or time.",
    );
  }

  const quote = quoteInterval({
    startAt: validation.startAt,
    endAt: validation.endAt,
    roomNumber: input.roomNumber,
    now,
  });
  const pendingExpiresAt = new Date(
    now.getTime() + PROTOTYPE_SETTINGS.stay.approvalTimeoutMinutes * 60 * 1000,
  ).toISOString();

  const booking: PrototypeBooking = {
    id: newBookingId(),
    ref: generateBookingRef(state),
    roomNumber: input.roomNumber,
    status: "pending_approval",
    startAt: validation.startAt,
    endAt: validation.endAt,
    durationMinutes: validation.durationMinutes,
    guests: { adults: input.adults, children: input.children },
    guest: {
      name: input.guest.name.trim(),
      phone: input.guest.phone.trim(),
      email: input.guest.email?.trim() || undefined,
      nationality: input.guest.nationality?.trim() || undefined,
      address: input.guest.address?.trim() || undefined,
      vehicleNumber: input.guest.vehicleNumber?.trim() || undefined,
      notes: input.guest.notes?.trim() || undefined,
    },
    quote,
    source: "website",
    createdAt: nowIso,
    idempotencyKey: input.idempotencyKey,
    pendingExpiresAt,
    payments: [],
    documents: [],
  };

  let next = { ...state, bookings: [booking, ...state.bookings] };
  next = audit(
    next,
    "booking.requested",
    {
      ref: booking.ref,
      roomNumber: booking.roomNumber,
      detail: `${formatColomboDateTime(booking.startAt)} to ${formatColomboDateTime(booking.endAt)}`,
    },
    nowIso,
  );
  next = outbox(next, booking, nowIso);
  return success(next, { booking });
}

function refreshExpired(state: PrototypeState, now: Date | string): PrototypeState {
  const nowDate = new Date(now);
  let changed = false;
  const bookings = state.bookings.map((booking) => {
    if (
      booking.status === "pending_approval" &&
      booking.pendingExpiresAt &&
      new Date(booking.pendingExpiresAt).getTime() <= nowDate.getTime()
    ) {
      changed = true;
      return {
        ...booking,
        status: "expired" as StayStatus,
        pendingExpiresAt: undefined,
      };
    }
    return booking;
  });
  return changed ? { ...state, bookings } : state;
}

export function expirePending(
  state: PrototypeState,
  now: Date | string = new Date(),
): { state: PrototypeState; changed: boolean } {
  const next = refreshExpired(state, now);
  return { state: next, changed: next !== state };
}

export function approveBooking(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const now = new Date(nowValue);
  const nowIso = now.toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "pending_approval") {
    return failure(
      "INVALID_STATE",
      "This request is no longer waiting for approval.",
    );
  }

  const wasExpired = isPendingExpired(booking, now);
  const conflict = roomConflict(
    state,
    booking.roomNumber,
    booking.startAt,
    booking.endAt,
    now,
    booking.ref,
  );
  if (conflict) {
    return wasExpired
      ? failure(
          "HOLD_EXPIRED",
          "This request expired and the room has since been taken. Ask the guest to choose another room.",
        )
      : failure("ROOM_UNAVAILABLE", "That room is no longer free for this request.");
  }

  const approved: PrototypeBooking = {
    ...booking,
    status: "approved",
    pendingExpiresAt: undefined,
    approval: { decidedAt: nowIso },
  };
  let next = replaceBooking(state, approved);
  next = audit(
    next,
    "booking.approved",
    { ref, roomNumber: booking.roomNumber },
    nowIso,
  );
  return success(next, { booking: approved });
}

export function rejectBooking(
  state: PrototypeState,
  ref: string,
  reason: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "pending_approval") {
    return failure("INVALID_STATE", "This request is no longer pending.");
  }
  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return failure("VALIDATION_ERROR", "Give a short reason for the rejection.");
  }
  const rejected: PrototypeBooking = {
    ...booking,
    status: "rejected",
    pendingExpiresAt: undefined,
    rejectionReason: trimmed,
    approval: { decidedAt: nowIso, reason: trimmed },
  };
  let next = replaceBooking(state, rejected);
  next = audit(
    next,
    "booking.rejected",
    { ref, roomNumber: booking.roomNumber, detail: trimmed },
    nowIso,
  );
  return success(next, { booking: rejected });
}

export function cancelBooking(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "pending_approval" && booking.status !== "approved") {
    return failure("INVALID_STATE", "This booking can no longer be cancelled online.");
  }
  const cancelled: PrototypeBooking = {
    ...booking,
    status: "cancelled",
    cancelledAt: nowIso,
    pendingExpiresAt: undefined,
  };
  let next = replaceBooking(state, cancelled);
  next = audit(next, "booking.cancelled", { ref, roomNumber: booking.roomNumber }, nowIso);
  return success(next, { booking: cancelled });
}

export function checkInBooking(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "approved") {
    return failure("INVALID_STATE", "Only an approved booking can be checked in.");
  }
  const checkedIn: PrototypeBooking = {
    ...booking,
    status: "checked_in",
    checkedInAt: nowIso,
  };
  let next = replaceBooking(state, checkedIn);
  next = audit(next, "booking.checked-in", { ref, roomNumber: booking.roomNumber }, nowIso);
  return success(next, { booking: checkedIn });
}

export function markNoShow(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "approved") {
    return failure("INVALID_STATE", "Only an approved booking can be marked no-show.");
  }
  const noShow: PrototypeBooking = {
    ...booking,
    status: "no_show",
    noShowAt: nowIso,
  };
  let next = replaceBooking(state, noShow);
  next = audit(next, "booking.no-show", { ref, roomNumber: booking.roomNumber }, nowIso);
  return success(next, { booking: noShow });
}

function documentPrefix(type: DocumentType): "BILL" | "RCT" | "INV" {
  if (type === "BILL") return "BILL";
  if (type === "RECEIPT") return "RCT";
  return "INV";
}

function issueDocumentNumber(
  state: PrototypeState,
  type: DocumentType,
  at: string,
): { state: PrototypeState; number: string } {
  const year = String(colomboParts(at).year);
  const prefix = documentPrefix(type);
  const counterKey =
    type === "BILL" ? "bill" : type === "RECEIPT" ? "receipt" : "invoice";
  const current = state.counters[counterKey][year] ?? 0;
  const nextNumber = current + 1;
  const counters = {
    ...state.counters,
    [counterKey]: {
      ...state.counters[counterKey],
      [year]: nextNumber,
    },
  };
  return {
    state: { ...state, counters },
    number: `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`,
  };
}

function paymentTotal(booking: PrototypeBooking): number {
  return booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function balanceFor(booking: PrototypeBooking): number {
  return Math.max(0, booking.quote.total - paymentTotal(booking));
}

export function paidFor(booking: PrototypeBooking): number {
  return paymentTotal(booking);
}

export function documentSnapshot(booking: PrototypeBooking): DocumentSnapshot {
  const paid = paidFor(booking);
  return {
    hotelName: resort.name,
    ref: booking.ref,
    roomNumber: booking.roomNumber,
    guestName: booking.guest.name,
    guestPhone: booking.guest.phone,
    startAt: booking.startAt,
    endAt: booking.endAt,
    durationMinutes: booking.durationMinutes,
    durationLabel: booking.quote.durationLabel,
    adults: booking.guests.adults,
    children: booking.guests.children,
    lines: booking.quote.lines.map((line) => ({ ...line })),
    subtotal: booking.quote.subtotal,
    taxLines: booking.quote.taxLines.map((line) => ({ ...line })),
    taxTotal: booking.quote.taxTotal,
    total: booking.quote.total,
    payments: booking.payments.map((payment) => ({ ...payment })),
    paid,
    balance: Math.max(0, booking.quote.total - paid),
  };
}

function withDocument(
  booking: PrototypeBooking,
  document: PrototypeDocument,
): PrototypeBooking {
  return {
    ...booking,
    documents: [
      document,
      ...booking.documents.map((item) =>
        document.type === "BILL" && item.type === "BILL"
          ? { ...item, isCurrent: false }
          : item,
      ),
    ],
  };
}

export function generateBill(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking; document: PrototypeDocument }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "checked_in" && booking.status !== "approved") {
    return failure(
      "INVALID_STATE",
      "A bill can be generated while the booking is approved or in house.",
    );
  }

  const issued = issueDocumentNumber(state, "BILL", nowIso);
  const document: PrototypeDocument = {
    number: issued.number,
    type: "BILL",
    issuedAt: nowIso,
    isCurrent: true,
    snapshot: documentSnapshot(booking),
  };
  const updated = withDocument(booking, document);
  let next = replaceBooking(issued.state, updated);
  next = audit(
    next,
    "bill.generated",
    { ref, roomNumber: booking.roomNumber, detail: document.number },
    nowIso,
  );
  return success(next, { booking: updated, document });
}

export type PaymentInput = {
  method: PaymentMethod;
  amount: number;
  tendered?: number;
  reference?: string;
};

export function recordPayment(
  state: PrototypeState,
  ref: string,
  input: PaymentInput,
  nowValue: Date | string = new Date(),
): EngineResult<{
  booking: PrototypeBooking;
  payment: PrototypeBooking["payments"][number];
  receipt: PrototypeDocument;
}> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "checked_in" && booking.status !== "approved") {
    return failure(
      "INVALID_STATE",
      "Payments can only be recorded for an approved or in-house booking.",
    );
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    return failure("PAYMENT_ERROR", "Enter a payment amount greater than zero.");
  }
  const balance = balanceFor(booking);
  if (input.amount > balance) {
    return failure(
      "PAYMENT_ERROR",
      "The payment cannot be more than the outstanding balance.",
    );
  }
  if (input.method === "cash") {
    if (input.tendered !== undefined && input.tendered < input.amount) {
      return failure(
        "PAYMENT_ERROR",
        "Cash tendered must be at least the amount received.",
      );
    }
  }

  const issued = issueDocumentNumber(state, "RECEIPT", nowIso);
  const payment = {
    id: newId("payment"),
    receiptNumber: issued.number,
    method: input.method,
    amount: input.amount,
    tendered: input.method === "cash" ? input.tendered : undefined,
    change:
      input.method === "cash" && input.tendered !== undefined
        ? input.tendered - input.amount
        : undefined,
    reference: input.reference?.trim() || undefined,
    createdAt: nowIso,
  };
  const withPayment: PrototypeBooking = {
    ...booking,
    payments: [...booking.payments, payment],
  };
  const receipt: PrototypeDocument = {
    number: issued.number,
    type: "RECEIPT",
    issuedAt: nowIso,
    isCurrent: true,
    snapshot: documentSnapshot(withPayment),
  };
  const updated = withDocument(withPayment, receipt);
  let next = replaceBooking(issued.state, updated);
  next = audit(
    next,
    "payment.recorded",
    {
      ref,
      roomNumber: booking.roomNumber,
      detail: `${issued.number} · ${input.method} · ${input.amount}`,
    },
    nowIso,
  );
  return success(next, { booking: updated, payment, receipt });
}

export function checkOutBooking(
  state: PrototypeState,
  ref: string,
  options: { unsettledReason?: string } = {},
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking; invoice: PrototypeDocument }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "checked_in") {
    return failure("INVALID_STATE", "Only an in-house guest can be checked out.");
  }
  const balance = balanceFor(booking);
  const reason = options.unsettledReason?.trim();
  if (balance > 0 && !reason) {
    return failure(
      "PAYMENT_ERROR",
      "Record the remaining balance before checking out, or give a reason for an unsettled check-out.",
    );
  }

  const issued = issueDocumentNumber(state, "FINAL", nowIso);
  const checkedOut: PrototypeBooking = {
    ...booking,
    status: "checked_out",
    checkedOutAt: nowIso,
    unsettledReason: reason,
  };
  const invoice: PrototypeDocument = {
    number: issued.number,
    type: "FINAL",
    issuedAt: nowIso,
    isCurrent: true,
    snapshot: documentSnapshot(checkedOut),
  };
  const updated = withDocument(checkedOut, invoice);
  let next = replaceBooking(issued.state, updated);
  next = audit(
    next,
    "booking.checked-out",
    { ref, roomNumber: booking.roomNumber, detail: issued.number },
    nowIso,
  );
  return success(next, { booking: updated, invoice });
}

export type BlockInput = {
  roomNumber: string;
  startAt: string;
  endAt: string;
  reason: string;
};

export function blockRoom(
  state: PrototypeState,
  input: BlockInput,
  nowValue: Date | string = new Date(),
): EngineResult<{ block: RoomBlock }> {
  const nowIso = new Date(nowValue).toISOString();
  const validation = validateWindow(
    { startAt: input.startAt, endAt: input.endAt },
    nowValue,
    { allowPast: true },
  );
  if (!validation.ok) return failure("VALIDATION_ERROR", validation.message);
  if (!isRoomNumber(input.roomNumber)) {
    return failure("VALIDATION_ERROR", "Choose a room.");
  }
  if (input.reason.trim().length < 3) {
    return failure("VALIDATION_ERROR", "Give a short reason for the block.");
  }
  const conflict = roomConflict(
    state,
    input.roomNumber,
    validation.startAt,
    validation.endAt,
    nowValue,
  );
  if (conflict) {
    return failure(
      "ROOM_UNAVAILABLE",
      "That room is already occupied or blocked for part of this window.",
    );
  }
  const block: RoomBlock = {
    id: newId("block"),
    roomNumber: input.roomNumber,
    startAt: validation.startAt,
    endAt: validation.endAt,
    reason: input.reason.trim(),
    createdAt: nowIso,
  };
  let next = { ...state, blocks: [block, ...state.blocks] };
  next = audit(
    next,
    "room.blocked",
    { roomNumber: block.roomNumber, detail: block.reason },
    nowIso,
  );
  return success(next, { block });
}

export function unblockRoom(
  state: PrototypeState,
  blockId: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ block: RoomBlock }> {
  const nowIso = new Date(nowValue).toISOString();
  const block = state.blocks.find((item) => item.id === blockId);
  if (!block) return failure("NOT_FOUND", "Block not found.");
  let next = {
    ...state,
    blocks: state.blocks.filter((item) => item.id !== blockId),
  };
  next = audit(
    next,
    "room.unblocked",
    { roomNumber: block.roomNumber },
    nowIso,
  );
  return success(next, { block });
}

export function editBookingWindow(
  state: PrototypeState,
  ref: string,
  interval: { startAt: string; endAt: string },
  nowValue: Date | string = new Date(),
): EngineResult<{ booking: PrototypeBooking }> {
  const nowIso = new Date(nowValue).toISOString();
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  if (booking.status !== "approved" && booking.status !== "pending_approval") {
    return failure("INVALID_STATE", "This booking can no longer be edited.");
  }
  const validation = validateWindow(interval, nowValue, { allowPast: true });
  if (!validation.ok) return failure("VALIDATION_ERROR", validation.message);
  const conflict = roomConflict(
    state,
    booking.roomNumber,
    validation.startAt,
    validation.endAt,
    nowValue,
    booking.ref,
  );
  if (conflict) {
    return failure("ROOM_UNAVAILABLE", "The room is not free for the new window.");
  }
  const quote = quoteInterval({
    ...validation,
    roomNumber: booking.roomNumber,
    now: nowValue,
  });
  const updated: PrototypeBooking = {
    ...booking,
    startAt: validation.startAt,
    endAt: validation.endAt,
    durationMinutes: validation.durationMinutes,
    quote,
  };
  let next = replaceBooking(state, updated);
  next = audit(
    next,
    "booking.window-edited",
    {
      ref,
      roomNumber: booking.roomNumber,
      detail: `${formatColomboDateTime(updated.startAt)} to ${formatColomboDateTime(updated.endAt)}`,
    },
    nowIso,
  );
  return success(next, { booking: updated });
}

export function setHousekeeping(
  state: PrototypeState,
  roomNumber: string,
  status: PrototypeState["housekeeping"][string],
  nowValue: Date | string = new Date(),
): EngineResult<{ roomNumber: string; status: string }> {
  if (!isRoomNumber(roomNumber)) return failure("VALIDATION_ERROR", "Choose a room.");
  const nowIso = new Date(nowValue).toISOString();
  let next: PrototypeState = {
    ...state,
    housekeeping: { ...state.housekeeping, [roomNumber]: status },
  };
  next = audit(
    next,
    "housekeeping.updated",
    { roomNumber, detail: status },
    nowIso,
  );
  return success(next, { roomNumber, status });
}

export function logPiiReveal(
  state: PrototypeState,
  ref: string,
  nowValue: Date | string = new Date(),
): EngineResult<{ ref: string }> {
  const booking = findBooking(state, ref);
  if (!booking) return failure("NOT_FOUND", "Booking not found.");
  const nowIso = new Date(nowValue).toISOString();
  const next = audit(
    state,
    "pii.revealed",
    { ref, roomNumber: booking.roomNumber, detail: "ID document number" },
    nowIso,
  );
  return success(next, { ref });
}
