import "server-only";

import { nightsBetween, type DateKey } from "@/lib/dates";
import type { PaymentMethod } from "@/lib/constants";
import { RoomUnavailableError, errors } from "@/server/lib/errors";
import { demoOccupiedByNight } from "@/server/demo-occupancy";
import type {
  BookingStore,
  EnquiryRecord,
  OccupiedNight,
  StoredBooking,
} from "@/server/store/types";

type DemoState = {
  bookings: Map<string, StoredBooking>;
  enquiries: EnquiryRecord[];
  subscribers: Set<string>;
  queue: Promise<unknown>;
};

const globalForStore = globalThis as typeof globalThis & {
  __palmyrahDemoStore?: DemoState;
};

const state: DemoState =
  globalForStore.__palmyrahDemoStore ??
  (globalForStore.__palmyrahDemoStore = {
    bookings: new Map(),
    enquiries: [],
    subscribers: new Set(),
    queue: Promise.resolve(),
  });

function withLock<T>(work: () => Promise<T> | T): Promise<T> {
  const run = state.queue.then(work, work);
  state.queue = run.catch(() => undefined);
  return run;
}

function activeBookings(): StoredBooking[] {
  return [...state.bookings.values()].filter(
    (booking) => booking.status === "confirmed",
  );
}

function demoAndStoredOccupancy(
  from: DateKey,
  to: DateKey,
): Map<DateKey, Set<string>> {
  const byNight = demoOccupiedByNight(from, to);
  for (const booking of activeBookings()) {
    const nights = nightsBetween(booking.checkIn, booking.checkOut);
    for (const night of nights) {
      if (night < from || night >= to) continue;
      const slot = byNight.get(night);
      if (slot) {
        for (const room of booking.rooms) slot.add(room.roomId);
      }
    }
  }
  return byNight;
}

/**
 * Instance-local demo persistence. Bookings survive while the serverless
 * instance stays warm; set MONGODB_URI for durable, cross-instance storage.
 */
export const demoStore: BookingStore = {
  mode: "demo",

  async occupancy(from, to) {
    const byNight = demoAndStoredOccupancy(from, to);
    const rows: OccupiedNight[] = [];
    for (const [night, rooms] of byNight) {
      for (const roomId of rooms) rows.push({ roomId, night });
    }
    return rows;
  },

  async create(record) {
    return withLock(async () => {
      const byNight = demoAndStoredOccupancy(record.checkIn, record.checkOut);
      for (const room of record.rooms) {
        for (const night of nightsBetween(record.checkIn, record.checkOut)) {
          if (byNight.get(night)?.has(room.roomId)) {
            throw new RoomUnavailableError();
          }
        }
      }
      if (state.bookings.has(record.ref)) {
        throw errors.conflict("That booking reference is already in use.");
      }
      state.bookings.set(record.ref, structuredClone(record));
    });
  },

  async findByRef(ref) {
    const booking = state.bookings.get(ref);
    return booking ? structuredClone(booking) : null;
  },

  async findByIdempotencyKey(key) {
    const booking = [...state.bookings.values()].find(
      (item) => item.idempotencyKey === key,
    );
    return booking ? structuredClone(booking) : null;
  },

  async cancel(ref) {
    return withLock(() => {
      const booking = state.bookings.get(ref);
      if (!booking) return null;
      if (booking.status === "confirmed") {
        booking.status = "cancelled";
        booking.cancelledAt = new Date().toISOString();
      }
      return structuredClone(booking);
    });
  },

  async markDepositPaid(ref, method: PaymentMethod) {
    return withLock(() => {
      const booking = state.bookings.get(ref);
      if (!booking) return null;
      if (booking.payment.depositPaid) {
        return structuredClone(booking);
      }
      booking.payment.depositPaid = true;
      booking.payment.paymentMethod = method;
      booking.payment.paidAt = new Date().toISOString();
      return structuredClone(booking);
    });
  },

  async saveEnquiry(record) {
    state.enquiries.push(structuredClone(record));
  },

  async saveSubscriber(email, source) {
    state.subscribers.add(`${email}|${source}`);
  },
};
