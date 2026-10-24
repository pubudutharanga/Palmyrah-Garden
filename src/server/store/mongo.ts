import "server-only";

import mongoose from "mongoose";

import { nightsBetween, type DateKey } from "@/lib/dates";
import type { PaymentMethod } from "@/lib/constants";
import { errors, RoomUnavailableError } from "@/server/lib/errors";
import { connectDb } from "@/server/db/connect";
import {
  BookingModel,
  EnquiryModel,
  RoomNightModel,
  SubscriberModel,
  type BookingDoc,
} from "@/server/db/models";
import type {
  BookingStore,
  EnquiryRecord,
  StoredBooking,
} from "@/server/store/types";

function isDuplicateKey(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000,
  );
}

function isRoomNightDuplicate(error: unknown): boolean {
  if (!isDuplicateKey(error)) return false;
  const serialised = JSON.stringify(error);
  return (
    serialised.includes("roomId_1_night_1") ||
    serialised.includes('"roomId"')
  );
}

function toStored(doc: BookingDoc): StoredBooking {
  return doc as unknown as StoredBooking;
}

export const mongoStore: BookingStore = {
  mode: "mongo",

  async occupancy(from: DateKey, to: DateKey) {
    await connectDb();
    const rows = await RoomNightModel.find({
      night: { $gte: from, $lt: to },
      $or: [
        { state: "booked" },
        { state: "blocked" },
        { state: "held", expiresAt: { $gt: new Date() } },
      ],
    })
      .select({ roomId: 1, night: 1, _id: 0 })
      .lean<{ roomId: string; night: DateKey }[]>();

    return rows.map((row) => ({ roomId: row.roomId, night: row.night }));
  },

  async create(record) {
    await connectDb();
    const nights = nightsBetween(record.checkIn, record.checkOut);
    const rows = record.rooms.flatMap((room) =>
      nights.map((night) => ({
        roomId: room.roomId,
        roomTypeId: room.roomTypeId,
        night,
        state: "booked" as const,
        bookingId: record.ref,
        createdAt: new Date().toISOString(),
      })),
    );

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(
        async () => {
          await RoomNightModel.insertMany(rows, { session, ordered: true });
          await BookingModel.create([record], { session });
        },
        {
          readConcern: { level: "snapshot" },
          writeConcern: { w: "majority" },
          readPreference: "primary",
        },
      );
    } catch (error) {
      if (isRoomNightDuplicate(error)) throw new RoomUnavailableError();
      if (isDuplicateKey(error)) {
        throw errors.conflict("That booking is already saved. Refresh to see it.");
      }
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async findByRef(ref) {
    await connectDb();
    const doc = await BookingModel.findOne({ ref }).lean<BookingDoc | null>();
    return doc ? toStored(doc) : null;
  },

  async findByIdempotencyKey(key) {
    await connectDb();
    const doc = await BookingModel.findOne({ idempotencyKey: key }).lean<BookingDoc | null>();
    return doc ? toStored(doc) : null;
  },

  async cancel(ref) {
    await connectDb();
    const session = await mongoose.startSession();
    try {
      let updated: BookingDoc | null = null;
      await session.withTransaction(
        async () => {
          const existing = await BookingModel.findOne({ ref })
            .session(session)
            .lean<BookingDoc | null>();
          if (!existing) return;
          if (existing.status === "confirmed") {
            const cancelledAt = new Date().toISOString();
            const doc = await BookingModel.findOneAndUpdate(
              { ref, status: "confirmed" },
              { $set: { status: "cancelled", cancelledAt } },
              { new: true, session },
            ).lean<BookingDoc | null>();
            updated = doc;
            await RoomNightModel.deleteMany({ bookingId: ref }, { session });
          } else {
            updated = existing;
          }
        },
        {
          readConcern: { level: "snapshot" },
          writeConcern: { w: "majority" },
          readPreference: "primary",
        },
      );
      return updated ? toStored(updated) : null;
    } finally {
      await session.endSession();
    }
  },

  async markDepositPaid(ref, method: PaymentMethod) {
    await connectDb();
    const doc = await BookingModel.findOneAndUpdate(
      { ref, "payment.depositPaid": { $ne: true } },
      {
        $set: {
          "payment.depositPaid": true,
          "payment.paymentMethod": method,
          "payment.paidAt": new Date().toISOString(),
        },
      },
      { new: true },
    ).lean<BookingDoc | null>();
    if (doc) return toStored(doc);
    const existing = await BookingModel.findOne({ ref }).lean<BookingDoc | null>();
    return existing ? toStored(existing) : null;
  },

  async saveEnquiry(record: EnquiryRecord) {
    await connectDb();
    await EnquiryModel.create({
      ...record,
      status: "new",
    });
  },

  async saveSubscriber(email, source) {
    await connectDb();
    await SubscriberModel.updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          source,
          consentAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
  },
};
