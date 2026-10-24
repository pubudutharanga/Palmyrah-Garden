import { PROTOTYPE_SETTINGS, PROTOTYPE_STORE_VERSION } from "@/lib/prototype/settings";
import { quoteInterval } from "@/lib/prototype/pricing";
import type {
  DocumentSnapshot,
  PrototypeBooking,
  PrototypeDocument,
  PrototypePayment,
  PrototypeState,
  StayStatus,
} from "@/lib/prototype/types";
import {
  addColomboDays,
  addMinutes,
  colomboParts,
  formatColomboDateTime,
  fromColomboParts,
  minutesBetween,
  startOfColomboDay,
} from "@/lib/prototype/time";
import { BOARD_ROOMS } from "@/content/room-board";
import { resort } from "@/content/resort";

type SeedBookingInput = {
  ref: string;
  roomNumber: string;
  status: StayStatus;
  startAt: string;
  endAt: string;
  guest: {
    name: string;
    phone: string;
    email?: string;
    nationality?: string;
    idNumber?: string;
    notes?: string;
  };
  adults?: number;
  children?: number;
  pendingExpiresAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  noShowAt?: string;
  rejectionReason?: string;
  source?: PrototypeBooking["source"];
  paid?: boolean;
};

function at(
  base: Date,
  dayOffset: number,
  hour: number,
  minute = 0,
): Date {
  const parts = colomboParts(base);
  return fromColomboParts(
    parts.year,
    parts.month,
    parts.day + dayOffset,
    hour,
    minute,
  );
}

function futureAt(base: Date, dayOffset: number, hour: number, now: Date): Date {
  let candidate = at(base, dayOffset, hour);
  while (candidate.getTime() <= now.getTime() + 30 * 60 * 1000) {
    candidate = addColomboDays(candidate, 1);
  }
  return candidate;
}

function makeSnapshot(booking: PrototypeBooking): DocumentSnapshot {
  const paid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
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

function seedBooking(
  input: SeedBookingInput,
  now: Date,
  counters: { bill: Record<string, number>; receipt: Record<string, number>; invoice: Record<string, number> },
): PrototypeBooking {
  const startAt = input.startAt;
  const endAt = input.endAt;
  const quote = quoteInterval({
    startAt,
    endAt,
    roomNumber: input.roomNumber,
    now,
  });
  const payments: PrototypePayment[] = [];
  const documents: PrototypeDocument[] = [];

  if (input.paid) {
    const year = String(colomboParts(startAt).year);
    const receiptCounter = (counters.receipt[year] ?? 0) + 1;
    counters.receipt[year] = receiptCounter;
    const receiptNumber = `RCT-${year}-${String(receiptCounter).padStart(6, "0")}`;
    payments.push({
      id: `seed_payment_${input.ref}`,
      receiptNumber,
      method: "card",
      amount: quote.total,
      reference: "Seed demo settlement",
      createdAt: input.checkedOutAt ?? endAt,
    });

    const invoiceCounter = (counters.invoice[year] ?? 0) + 1;
    counters.invoice[year] = invoiceCounter;
    const invoiceNumber = `INV-${year}-${String(invoiceCounter).padStart(6, "0")}`;

    const baseBooking: PrototypeBooking = {
      id: `seed_${input.ref}`,
      ref: input.ref,
      roomNumber: input.roomNumber,
      status: input.status,
      startAt,
      endAt,
      durationMinutes: minutesBetween(startAt, endAt),
      guests: { adults: input.adults ?? 2, children: input.children ?? 0 },
      guest: {
        name: input.guest.name,
        phone: input.guest.phone,
        email: input.guest.email,
        nationality: input.guest.nationality,
        idNumber: input.guest.idNumber,
        notes: input.guest.notes,
      },
      quote,
      source: input.source ?? "website",
      createdAt: addMinutes(startAt, -3 * 24 * 60).toISOString(),
      checkedInAt: input.checkedInAt,
      checkedOutAt: input.checkedOutAt,
      payments,
      documents,
    };

    const receiptSnapshot = makeSnapshot(baseBooking);
    documents.unshift({
      number: receiptNumber,
      type: "RECEIPT",
      issuedAt: input.checkedOutAt ?? endAt,
      isCurrent: true,
      snapshot: receiptSnapshot,
    });
    documents.unshift({
      number: invoiceNumber,
      type: "FINAL",
      issuedAt: input.checkedOutAt ?? endAt,
      isCurrent: true,
      snapshot: receiptSnapshot,
    });
    return { ...baseBooking, documents };
  }

  const booking: PrototypeBooking = {
    id: `seed_${input.ref}`,
    ref: input.ref,
    roomNumber: input.roomNumber,
    status: input.status,
    startAt,
    endAt,
    durationMinutes: minutesBetween(startAt, endAt),
    guests: { adults: input.adults ?? 2, children: input.children ?? 0 },
    guest: {
      name: input.guest.name,
      phone: input.guest.phone,
      email: input.guest.email,
      nationality: input.guest.nationality,
      idNumber: input.guest.idNumber,
      notes: input.guest.notes,
    },
    quote,
    source: input.source ?? "website",
    createdAt: addMinutes(startAt, -4 * 24 * 60).toISOString(),
    pendingExpiresAt: input.pendingExpiresAt,
    checkedInAt: input.checkedInAt,
    checkedOutAt: input.checkedOutAt,
    cancelledAt: input.cancelledAt,
    noShowAt: input.noShowAt,
    rejectionReason: input.rejectionReason,
    approval:
      input.status === "approved" || input.status === "checked_in"
        ? { decidedAt: addMinutes(startAt, -2 * 24 * 60).toISOString() }
        : undefined,
    payments,
    documents,
  };
  return booking;
}

export function createSeedState(nowValue: Date | string = new Date()): PrototypeState {
  const now = new Date(nowValue);
  const today = startOfColomboDay(now);
  const counters = {
    bill: {} as Record<string, number>,
    receipt: {} as Record<string, number>,
    invoice: {} as Record<string, number>,
  };

  const inHouseStart = at(today, -1, 14);
  const inHouseEnd = at(today, 1, 12);
  const inHouseStartB = at(today, -1, 19);
  const inHouseEndB = at(today, 1, 8);

  const nextEvening = futureAt(today, 0, 19, now);
  const nextMorning = addColomboDays(nextEvening, 1);
  const tomorrowAfternoon = at(today, 1, 14);
  const dayAfterNoon = at(today, 2, 12);
  const dayAfterEvening = at(today, 2, 19);
  const dayThreeMorning = at(today, 3, 8);
  const dayTwoEvening = at(today, 2, 14);

  const bookings: PrototypeBooking[] = [
    seedBooking(
      {
        ref: "PGR-7K3M9Q",
        roomNumber: "01",
        status: "checked_in",
        startAt: inHouseStart.toISOString(),
        endAt: inHouseEnd.toISOString(),
        checkedInAt: at(today, -1, 14, 25).toISOString(),
        guest: {
          name: "Nimal Perera",
          phone: "+94 77 123 4567",
          email: "nimal@example.lk",
          nationality: "Sri Lanka",
          idNumber: "Demo NIC 198512345678",
          notes: "Quiet room away from the road, please.",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-4T8N2P",
        roomNumber: "03",
        status: "checked_in",
        startAt: inHouseStartB.toISOString(),
        endAt: inHouseEndB.toISOString(),
        checkedInAt: at(today, -1, 19, 10).toISOString(),
        guest: {
          name: "Fathima Rizwan",
          phone: "+94 76 981 4432",
          email: "fathima@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-8M2C5R",
        roomNumber: "05",
        status: "checked_in",
        startAt: at(today, -1, 20).toISOString(),
        endAt: at(today, 1, 9).toISOString(),
        checkedInAt: at(today, -1, 20, 30).toISOString(),
        guest: {
          name: "Daniel Fernando",
          phone: "+94 71 452 8801",
          email: "daniel@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-2D9X4H",
        roomNumber: "07",
        status: "checked_in",
        startAt: at(today, -1, 17).toISOString(),
        endAt: at(today, 1, 11).toISOString(),
        checkedInAt: at(today, -1, 17, 20).toISOString(),
        guest: {
          name: "Aisha Naleem",
          phone: "+94 77 663 1029",
          email: "aisha@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-6V1B7W",
        roomNumber: "09",
        status: "checked_in",
        startAt: at(today, -1, 12).toISOString(),
        endAt: at(today, 1, 12).toISOString(),
        checkedInAt: at(today, -1, 12, 40).toISOString(),
        guest: {
          name: "Thomas Weber",
          phone: "+49 151 2345 6789",
          email: "thomas@example.de",
          nationality: "Germany",
          notes: "Late breakfast on the first morning.",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-9C4K2A",
        roomNumber: "11",
        status: "approved",
        startAt: nextEvening.toISOString(),
        endAt: nextMorning.toISOString(),
        guest: {
          name: "Priya Selvan",
          phone: "+94 75 334 9021",
          email: "priya@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-3F7R8N",
        roomNumber: "13",
        status: "approved",
        startAt: nextEvening.toISOString(),
        endAt: nextMorning.toISOString(),
        guest: {
          name: "James Okafor",
          phone: "+44 7700 900123",
          email: "james@example.co.uk",
          nationality: "United Kingdom",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-5H2Q6T",
        roomNumber: "15",
        status: "approved",
        startAt: tomorrowAfternoon.toISOString(),
        endAt: dayAfterNoon.toISOString(),
        guest: {
          name: "Maya Krishnan",
          phone: "+91 98400 12345",
          email: "maya@example.in",
          nationality: "India",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-1W8S3J",
        roomNumber: "17",
        status: "approved",
        startAt: tomorrowAfternoon.toISOString(),
        endAt: dayAfterNoon.toISOString(),
        guest: {
          name: "Rohan de Silva",
          phone: "+94 77 812 5590",
          email: "rohan@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-7N4Y9E",
        roomNumber: "21",
        status: "approved",
        startAt: dayTwoEvening.toISOString(),
        endAt: at(today, 3, 12).toISOString(),
        guest: {
          name: "Hannah Müller",
          phone: "+49 160 555 7788",
          email: "hannah@example.de",
          nationality: "Germany",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-2P6L1D",
        roomNumber: "23",
        status: "approved",
        startAt: dayAfterEvening.toISOString(),
        endAt: dayThreeMorning.toISOString(),
        guest: {
          name: "Mohamed Aslam",
          phone: "+94 72 145 6677",
          email: "aslam@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-8R3T5C",
        roomNumber: "02",
        status: "pending_approval",
        startAt: nextEvening.toISOString(),
        endAt: nextMorning.toISOString(),
        pendingExpiresAt: addMinutes(now, 88).toISOString(),
        guest: {
          name: "Sarah Bennett",
          phone: "+44 7700 900456",
          email: "sarah@example.co.uk",
          nationality: "United Kingdom",
          notes: "Arriving after a late train from Colombo.",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-4J9M2B",
        roomNumber: "04",
        status: "pending_approval",
        startAt: nextEvening.toISOString(),
        endAt: nextMorning.toISOString(),
        pendingExpiresAt: addMinutes(now, 64).toISOString(),
        guest: {
          name: "Arun Prasad",
          phone: "+91 99400 55667",
          email: "arun@example.in",
          nationality: "India",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-6B1V8K",
        roomNumber: "06",
        status: "pending_approval",
        startAt: tomorrowAfternoon.toISOString(),
        endAt: dayAfterNoon.toISOString(),
        pendingExpiresAt: addMinutes(now, 105).toISOString(),
        guest: {
          name: "Chathuri Jayasuriya",
          phone: "+94 70 221 7845",
          email: "chathuri@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-3A8D6F",
        roomNumber: "08",
        status: "checked_out",
        startAt: at(today, -3, 14).toISOString(),
        endAt: at(today, -2, 12).toISOString(),
        checkedInAt: at(today, -3, 14, 20).toISOString(),
        checkedOutAt: at(today, -2, 11, 40).toISOString(),
        guest: {
          name: "Lena Fischer",
          phone: "+49 170 223 4455",
          email: "lena@example.de",
          nationality: "Germany",
        },
        paid: true,
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-9E5G1H",
        roomNumber: "10",
        status: "checked_out",
        startAt: at(today, -5, 19).toISOString(),
        endAt: at(today, -4, 8).toISOString(),
        checkedInAt: at(today, -5, 19, 15).toISOString(),
        checkedOutAt: at(today, -4, 8, 10).toISOString(),
        guest: {
          name: "Kavitha Raman",
          phone: "+91 98410 33221",
          email: "kavitha@example.in",
          nationality: "India",
        },
        paid: true,
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-5S7M3L",
        roomNumber: "12",
        status: "cancelled",
        startAt: at(today, -1, 19).toISOString(),
        endAt: at(today, 0, 8).toISOString(),
        cancelledAt: at(today, -2, 10).toISOString(),
        guest: {
          name: "Peter Wright",
          phone: "+44 7700 900987",
          email: "peter@example.co.uk",
          nationality: "United Kingdom",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-2V4C6X",
        roomNumber: "14",
        status: "rejected",
        startAt: at(today, -6, 19).toISOString(),
        endAt: at(today, -5, 8).toISOString(),
        rejectionReason: "Room held for maintenance.",
        guest: {
          name: "Nadeesha Perera",
          phone: "+94 77 345 1100",
          email: "nadeesha@example.lk",
          nationality: "Sri Lanka",
        },
      },
      now,
      counters,
    ),
    seedBooking(
      {
        ref: "PGR-7H3F9Q",
        roomNumber: "16",
        status: "no_show",
        startAt: at(today, -2, 19).toISOString(),
        endAt: at(today, -1, 8).toISOString(),
        noShowAt: at(today, -1, 22).toISOString(),
        guest: {
          name: "Ibrahim Saleh",
          phone: "+971 50 553 7788",
          email: "ibrahim@example.ae",
          nationality: "United Arab Emirates",
        },
      },
      now,
      counters,
    ),
  ];

  // A generated bill for the in-house demo guest, so the counter screen has history.
  const billRoom = bookings.find((booking) => booking.ref === "PGR-7K3M9Q");
  if (billRoom) {
    const year = String(colomboParts(now).year);
    counters.bill[year] = 1;
    const billNumber = `BILL-${year}-000001`;
    billRoom.documents.unshift({
      number: billNumber,
      type: "BILL",
      issuedAt: addMinutes(now, -30).toISOString(),
      isCurrent: true,
      snapshot: makeSnapshot(billRoom),
    });
  }

  const housekeeping = Object.fromEntries(
    BOARD_ROOMS.map((room) => [
      room.number,
      room.number === "44" || room.number === "45" ? "dirty" : "clean",
    ]),
  );

  return {
    version: PROTOTYPE_STORE_VERSION,
    seededAt: now.toISOString(),
    bookings,
    blocks: [
      {
        id: "seed_block_44",
        roomNumber: "44",
        startAt: at(today, 0, 8).toISOString(),
        endAt: at(today, 3, 8).toISOString(),
        reason: "Garden irrigation works",
        createdAt: addMinutes(now, -4 * 60).toISOString(),
      },
      {
        id: "seed_block_45",
        roomNumber: "45",
        startAt: at(today, 1, 8).toISOString(),
        endAt: at(today, 4, 8).toISOString(),
        reason: "Bathroom regrouting",
        createdAt: addMinutes(now, -3 * 60).toISOString(),
      },
    ],
    housekeeping: housekeeping as PrototypeState["housekeeping"],
    counters,
    audit: [
      {
        id: "seed_audit_1",
        at: addMinutes(now, -30).toISOString(),
        action: "bill.generated",
        ref: "PGR-7K3M9Q",
        roomNumber: "01",
        detail: counters.bill[String(colomboParts(now).year)]
          ? `BILL-${colomboParts(now).year}-000001`
          : "Seed bill",
      },
    ],
    outbox: bookings
      .filter((booking) => booking.status === "pending_approval")
      .map((booking, index) => ({
        id: `seed_msg_${index}`,
        channel: "whatsapp" as const,
        to: "admin",
        template: "new_booking_alert",
        ref: booking.ref,
        status: "logged" as const,
        createdAt: addMinutes(now, -(index + 1) * 10).toISOString(),
      })),
  };
}

export function demoNote(): string {
  return `Demo bookings are generated around ${formatColomboDateTime(new Date())} and kept in this browser.`;
}

export const SEED_RATE_NOTE = `Sample rates: Non-AC LKR ${(
  PROTOTYPE_SETTINGS.pricing.non_ac.ratePer24h / 100
).toLocaleString("en-GB")} / 24 h · AC LKR ${(
  PROTOTYPE_SETTINGS.pricing.ac.ratePer24h / 100
).toLocaleString("en-GB")} / 24 h.`;
