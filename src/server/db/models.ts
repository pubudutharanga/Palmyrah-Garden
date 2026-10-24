import "server-only";

import mongoose, { Schema, type Model } from "mongoose";

import type { DateKey } from "@/lib/dates";
import type { MealPlan, PaymentMethod } from "@/lib/constants";
import type { BookingGuest, BookingRoom, BookingStatus, Quote } from "@/lib/types";

export type BookingDoc = {
  ref: string;
  idempotencyKey?: string;
  checkIn: DateKey;
  checkOut: DateKey;
  nights: number;
  guest: BookingGuest;
  rooms: BookingRoom[];
  mealPlan: MealPlan;
  quote: Quote;
  status: BookingStatus;
  payment: {
    method: "pay_at_resort" | "deposit";
    depositPaid: boolean;
    paymentMethod?: PaymentMethod;
    paidAt?: string;
  };
  createdAt: string;
  cancelledAt?: string;
};

const GuestSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const BookingRoomSchema = new Schema(
  {
    roomId: { type: String, required: true },
    roomNumber: { type: String, required: true },
    roomTypeId: { type: String, required: true },
    roomTypeName: { type: String, required: true },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const BookingSchema = new Schema(
  {
    ref: { type: String, required: true },
    idempotencyKey: { type: String },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nights: { type: Number, required: true },
    guest: { type: GuestSchema, required: true },
    rooms: { type: [BookingRoomSchema], required: true },
    mealPlan: { type: String, required: true },
    quote: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      required: true,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    payment: {
      method: {
        type: String,
        enum: ["pay_at_resort", "deposit"],
        required: true,
      },
      depositPaid: { type: Boolean, required: true, default: false },
      paymentMethod: {
        type: String,
        enum: ["card", "cash", "bank_transfer", "online", "other"],
      },
      paidAt: { type: String },
    },
    createdAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
    },
    cancelledAt: { type: String },
  },
  { versionKey: false },
);

BookingSchema.index({ ref: 1 }, { unique: true });
BookingSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
BookingSchema.index({ createdAt: -1 });

const RoomNightSchema = new Schema(
  {
    roomId: { type: String, required: true },
    roomTypeId: { type: String, required: true },
    night: { type: String, required: true },
    state: {
      type: String,
      required: true,
      enum: ["held", "booked", "blocked"],
    },
    bookingId: { type: String },
    blockId: { type: String },
    expiresAt: { type: Date },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false },
);

// The lock that makes overlapping bookings impossible.
RoomNightSchema.index({ roomId: 1, night: 1 }, { unique: true });
RoomNightSchema.index({ night: 1, roomTypeId: 1, state: 1 });
RoomNightSchema.index({ bookingId: 1 }, { sparse: true });
RoomNightSchema.index({ blockId: 1 }, { sparse: true });
RoomNightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    topic: { type: String, enum: ["stay", "group", "other"], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "handled"], default: "new" },
    ipHash: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false },
);

EnquirySchema.index({ status: 1, createdAt: -1 });

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    consentAt: { type: String, required: true },
    source: { type: String, required: true },
  },
  { versionKey: false },
);

export const BookingModel: Model<BookingDoc> =
  (mongoose.models.Booking as Model<BookingDoc> | undefined) ??
  (mongoose.model("Booking", BookingSchema) as unknown as Model<BookingDoc>);

export const RoomNightModel: Model<Record<string, unknown>> =
  (mongoose.models.RoomNight as Model<Record<string, unknown>> | undefined) ??
  (mongoose.model("RoomNight", RoomNightSchema) as unknown as Model<
    Record<string, unknown>
  >);

export const EnquiryModel: Model<Record<string, unknown>> =
  (mongoose.models.Enquiry as Model<Record<string, unknown>> | undefined) ??
  (mongoose.model("Enquiry", EnquirySchema) as unknown as Model<
    Record<string, unknown>
  >);

export const SubscriberModel: Model<Record<string, unknown>> =
  (mongoose.models.Subscriber as Model<Record<string, unknown>> | undefined) ??
  (mongoose.model("Subscriber", SubscriberSchema) as unknown as Model<
    Record<string, unknown>
  >);
