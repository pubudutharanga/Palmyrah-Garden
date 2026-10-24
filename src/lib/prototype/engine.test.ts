import { describe, expect, it } from "vitest";

import {
  approveBooking,
  balanceFor,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  createBookingRequest,
  generateBill,
  paidFor,
  recordPayment,
  rejectBooking,
} from "@/lib/prototype/engine";
import { findDocument } from "@/lib/prototype/documents";
import { createSeedState } from "@/lib/prototype/seed";
import { getBoardPayload, getRoomStatus } from "@/lib/prototype/status";
import { fromColomboParts } from "@/lib/prototype/time";
import type { PrototypeState } from "@/lib/prototype/types";

function emptyState(): PrototypeState {
  return {
    version: 1,
    seededAt: "2026-01-01T00:00:00.000Z",
    bookings: [],
    blocks: [],
    housekeeping: {},
    counters: { bill: {}, receipt: {}, invoice: {} },
    audit: [],
    outbox: [],
  };
}

const now = fromColomboParts(2026, 2, 9, 9, 30);

function request(
  state: PrototypeState,
  input: {
    roomNumber: string;
    startHour: number;
    endHour: number;
    phone?: string;
    name?: string;
    day?: number;
  },
) {
  const day = input.day ?? 10;
  return createBookingRequest(
    state,
    {
      roomNumber: input.roomNumber,
      startAt: fromColomboParts(2026, 2, day, input.startHour).toISOString(),
      endAt: fromColomboParts(2026, 2, day, input.endHour).toISOString(),
      adults: 2,
      children: 0,
      guest: {
        name: input.name ?? "Nimal Perera",
        phone: input.phone ?? "+94 77 123 4567",
      },
    },
    now,
  );
}

describe("booking lifecycle and counter billing", () => {
  it("runs request → approve → check-in → bill → split payments → final invoice", () => {
    let state = emptyState();

    const created = request(state, {
      roomNumber: "01",
      startHour: 10,
      endHour: 13,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    state = created.state;
    const ref = created.data.booking.ref;
    expect(created.data.booking.status).toBe("pending_approval");
    expect(created.data.booking.quote.total).toBe(973_500);
    expect(created.state.outbox[0].template).toBe("new_booking_alert");

    const approved = approveBooking(state, ref, now);
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    state = approved.state;
    expect(findBookingStatus(state, ref)).toBe("approved");

    const checkedIn = checkInBooking(state, ref, now);
    expect(checkedIn.ok).toBe(true);
    if (!checkedIn.ok) return;
    state = checkedIn.state;

    const firstBill = generateBill(state, ref, now);
    expect(firstBill.ok).toBe(true);
    if (!firstBill.ok) return;
    state = firstBill.state;
    expect(firstBill.data.document.number).toBe("BILL-2026-000001");

    const secondBill = generateBill(state, ref, now);
    expect(secondBill.ok).toBe(true);
    if (!secondBill.ok) return;
    state = secondBill.state;
    expect(secondBill.data.document.number).toBe("BILL-2026-000002");
    const bills = state.bookings[0].documents.filter((doc) => doc.type === "BILL");
    expect(bills).toHaveLength(2);
    expect(bills.filter((bill) => bill.isCurrent)).toHaveLength(1);
    expect(bills.find((bill) => bill.number === "BILL-2026-000001")?.isCurrent).toBe(false);

    const partial = recordPayment(
      state,
      ref,
      { method: "cash", amount: 500_000, tendered: 600_000 },
      now,
    );
    expect(partial.ok).toBe(true);
    if (!partial.ok) return;
    state = partial.state;
    expect(partial.data.receipt.type).toBe("RECEIPT");
    expect(partial.data.receipt.number).toBe("RCT-2026-000001");
    expect(partial.data.payment.change).toBe(100_000);
    expect(balanceFor(state.bookings[0])).toBe(473_500);

    const overpay = recordPayment(
      state,
      ref,
      { method: "card", amount: 473_501 },
      now,
    );
    expect(overpay.ok).toBe(false);
    if (!overpay.ok) expect(overpay.code).toBe("PAYMENT_ERROR");

    const finalPayment = recordPayment(
      state,
      ref,
      { method: "card", amount: 473_500, reference: "CARD-4412" },
      now,
    );
    expect(finalPayment.ok).toBe(true);
    if (!finalPayment.ok) return;
    state = finalPayment.state;
    expect(finalPayment.data.receipt.number).toBe("RCT-2026-000002");
    expect(paidFor(state.bookings[0])).toBe(973_500);
    expect(balanceFor(state.bookings[0])).toBe(0);

    const checkedOut = checkOutBooking(state, ref, {}, now);
    expect(checkedOut.ok).toBe(true);
    if (!checkedOut.ok) return;
    state = checkedOut.state;
    expect(findBookingStatus(state, ref)).toBe("checked_out");
    expect(checkedOut.data.invoice.number).toBe("INV-2026-000001");
    expect(checkedOut.data.invoice.snapshot.balance).toBe(0);

    const secondCheckout = checkOutBooking(state, ref, {}, now);
    expect(secondCheckout.ok).toBe(false);
    if (!secondCheckout.ok) expect(secondCheckout.code).toBe("INVALID_STATE");

    const found = findDocument(state, "INV-2026-000001");
    expect(found?.booking.ref).toBe(ref);
    expect(found?.document.type).toBe("FINAL");
    expect(state.bookings[0].documents).toHaveLength(5);
  });

  it("blocks check-out with a balance unless a reason is recorded", () => {
    let state = emptyState();
    const created = request(state, { roomNumber: "02", startHour: 10, endHour: 13 });
    if (!created.ok) throw new Error(created.message);
    state = created.state;
    const ref = created.data.booking.ref;
    const approved = approveBooking(state, ref, now);
    if (!approved.ok) throw new Error(approved.message);
    state = approved.state;
    const checkedIn = checkInBooking(state, ref, now);
    if (!checkedIn.ok) throw new Error(checkedIn.message);
    state = checkedIn.state;

    const blocked = checkOutBooking(state, ref, {}, now);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.code).toBe("PAYMENT_ERROR");

    const unsettled = checkOutBooking(
      state,
      ref,
      { unsettledReason: "Owner approved an invoice to follow." },
      now,
    );
    expect(unsettled.ok).toBe(true);
    if (!unsettled.ok) return;
    expect(unsettled.data.booking.unsettledReason).toMatch(/Owner approved/);
    expect(unsettled.data.invoice.snapshot.balance).toBe(973_500);
  });

  it("rejects invalid state transitions and records rejection reasons", () => {
    let state = emptyState();
    const created = request(state, { roomNumber: "03", startHour: 10, endHour: 13 });
    if (!created.ok) throw new Error(created.message);
    state = created.state;
    const ref = created.data.booking.ref;

    expect(checkInBooking(state, ref, now).ok).toBe(false);
    expect(generateBill(state, ref, now).ok).toBe(false);

    const rejected = rejectBooking(state, ref, "Room maintenance", now);
    expect(rejected.ok).toBe(true);
    if (!rejected.ok) return;
    expect(rejected.data.booking.status).toBe("rejected");
    expect(rejected.data.booking.rejectionReason).toBe("Room maintenance");
    expect(rejectBooking(rejected.state, ref, "Again", now).ok).toBe(false);
    expect(cancelBooking(rejected.state, ref, now).ok).toBe(false);
  });

  it("applies the turnaround buffer on both sides of a stay", () => {
    let state = emptyState();
    const first = request(state, {
      roomNumber: "04",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 111 1111",
    });
    if (!first.ok) throw new Error(first.message);
    state = first.state;

    const insideBuffer = request(state, {
      roomNumber: "04",
      startHour: 13,
      endHour: 16,
      phone: "+94 77 222 2222",
    });
    expect(insideBuffer.ok).toBe(false);
    if (!insideBuffer.ok) expect(insideBuffer.code).toBe("ROOM_UNAVAILABLE");

    const afterBuffer = request(state, {
      roomNumber: "04",
      startHour: 14,
      endHour: 17,
      phone: "+94 77 222 2222",
    });
    expect(afterBuffer.ok).toBe(true);
  });

  it("limits each phone to two active requests and frees the limit on approval", () => {
    let state = emptyState();
    const first = request(state, {
      roomNumber: "05",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 333 3333",
    });
    if (!first.ok) throw new Error(first.message);
    state = first.state;
    const second = request(state, {
      roomNumber: "06",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 333 3333",
    });
    if (!second.ok) throw new Error(second.message);
    state = second.state;

    const third = request(state, {
      roomNumber: "07",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 333 3333",
    });
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.code).toBe("LIMIT_REACHED");

    const approved = approveBooking(state, first.data.booking.ref, now);
    if (!approved.ok) throw new Error(approved.message);
    state = approved.state;
    const afterApproval = request(state, {
      roomNumber: "07",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 333 3333",
    });
    expect(afterApproval.ok).toBe(true);
  });

  it("re-locks an expired hold when the room is still free", () => {
    let state = emptyState();
    const created = request(state, { roomNumber: "08", startHour: 10, endHour: 13 });
    if (!created.ok) throw new Error(created.message);
    state = created.state;
    const ref = created.data.booking.ref;

    const later = new Date(now.getTime() + 121 * 60 * 1000);
    const approved = approveBooking(state, ref, later);
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    expect(approved.data.booking.status).toBe("approved");
    expect(approved.data.booking.pendingExpiresAt).toBeUndefined();
  });
});

describe("room board priority", () => {
  it("uses in-house > pending > blocked and collapses staff states for guests", () => {
    let state = emptyState();

    const stay = request(state, {
      roomNumber: "01",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 444 4444",
    });
    if (!stay.ok) throw new Error(stay.message);
    state = stay.state;
    const approved = approveBooking(state, stay.data.booking.ref, now);
    if (!approved.ok) throw new Error(approved.message);
    state = approved.state;
    const checkedIn = checkInBooking(state, stay.data.booking.ref, now);
    if (!checkedIn.ok) throw new Error(checkedIn.message);
    state = checkedIn.state;

    const pending = request(state, {
      roomNumber: "03",
      startHour: 10,
      endHour: 13,
      phone: "+94 77 555 5555",
    });
    if (!pending.ok) throw new Error(pending.message);
    state = pending.state;

    const from = fromColomboParts(2026, 2, 10, 10).toISOString();
    const to = fromColomboParts(2026, 2, 10, 13).toISOString();
    state = {
      ...state,
      blocks: [
        {
          id: "block_01",
          roomNumber: "01",
          startAt: from,
          endAt: to,
          reason: "Maintenance",
          createdAt: now.toISOString(),
        },
        {
          id: "block_02",
          roomNumber: "02",
          startAt: from,
          endAt: to,
          reason: "Deep clean",
          createdAt: now.toISOString(),
        },
      ],
    };

    expect(getRoomStatus("01", state, from, to, now, "admin").status).toBe("in_house");
    expect(getRoomStatus("01", state, from, to, now, "guest").status).toBe("booked");
    expect(getRoomStatus("02", state, from, to, now, "admin").status).toBe("blocked");
    expect(getRoomStatus("02", state, from, to, now, "guest").status).toBe("booked");
    expect(getRoomStatus("03", state, from, to, now, "admin").status).toBe("pending");
    expect(getRoomStatus("03", state, from, to, now, "guest").status).toBe("pending");
    expect(getRoomStatus("04", state, from, to, now, "admin").status).toBe("available");

    const payload = getBoardPayload({
      state,
      from,
      to,
      mode: "guest",
      now,
    });
    expect(payload.rooms).toHaveLength(46);
    expect(payload.rooms.length).toBe(46);
    expect(payload.counts.available + payload.counts.pending + payload.counts.booked).toBe(
      46,
    );
    expect(payload.counts.booked).toBe(2);
    expect(payload.counts.pending).toBe(1);
  });

  it("provides seed data relative to the current clock", () => {
    const state = createSeedState(now);
    expect(state.bookings.length).toBeGreaterThan(0);
    expect(state.bookings.some((booking) => booking.status === "checked_in")).toBe(true);
  });
});

function findBookingStatus(state: PrototypeState, ref: string) {
  return state.bookings.find((booking) => booking.ref === ref)?.status;
}
