import "server-only";

import type { DateKey } from "@/lib/dates";
import type { PaymentMethod } from "@/lib/constants";
import type { BookingRecord } from "@/lib/types";

export type StoredBooking = BookingRecord & { idempotencyKey?: string };

export type OccupiedNight = {
  roomId: string;
  night: DateKey;
};

export type EnquiryRecord = {
  name: string;
  email: string;
  phone?: string;
  topic: "stay" | "group" | "other";
  message: string;
  ipHash: string;
  status: "new";
  createdAt: string;
};

export interface BookingStore {
  readonly mode: "demo" | "mongo";
  occupancy(from: DateKey, to: DateKey): Promise<OccupiedNight[]>;
  create(record: StoredBooking): Promise<void>;
  findByRef(ref: string): Promise<StoredBooking | null>;
  findByIdempotencyKey(key: string): Promise<StoredBooking | null>;
  cancel(ref: string): Promise<StoredBooking | null>;
  markDepositPaid(ref: string, method: PaymentMethod): Promise<StoredBooking | null>;
  saveEnquiry(record: EnquiryRecord): Promise<void>;
  saveSubscriber(email: string, source: string): Promise<void>;
}
