import type { RoomCategoryId } from "@/content/room-board";
import type { QuoteLine, TaxLine } from "@/lib/types";

export type PrototypeVersion = 1;

export type StayStatus =
  | "pending_approval"
  | "approved"
  | "checked_in"
  | "checked_out"
  | "rejected"
  | "cancelled"
  | "no_show"
  | "expired";

export type RoomBoardState =
  | "available"
  | "pending"
  | "booked"
  | "in_house"
  | "blocked";

export type GuestVisibleState = "available" | "pending" | "booked";

export type PrototypeGuest = {
  name: string;
  phone: string;
  email?: string;
  nationality?: string;
  address?: string;
  vehicleNumber?: string;
  idNumber?: string;
  notes?: string;
};

export type PrototypeQuote = {
  startAt: string;
  endAt: string;
  durationMinutes: number;
  durationLabel: string;
  roomNumber: string;
  roomCategory?: RoomCategoryId;
  ratePer24h: number;
  ratePerHour: number;
  lines: QuoteLine[];
  subtotal: number;
  taxLines: TaxLine[];
  taxTotal: number;
  total: number;
  quotedAt: string;
};

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";

export type PrototypePayment = {
  id: string;
  receiptNumber: string;
  method: PaymentMethod;
  amount: number;
  tendered?: number;
  change?: number;
  reference?: string;
  createdAt: string;
};

export type DocumentType = "BILL" | "RECEIPT" | "FINAL";

export type DocumentSnapshot = {
  hotelName: string;
  ref: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  durationLabel: string;
  adults: number;
  children: number;
  lines: QuoteLine[];
  subtotal: number;
  taxLines: TaxLine[];
  taxTotal: number;
  total: number;
  payments: PrototypePayment[];
  paid: number;
  balance: number;
};

export type PrototypeDocument = {
  number: string;
  type: DocumentType;
  issuedAt: string;
  isCurrent: boolean;
  snapshot: DocumentSnapshot;
};

export type PrototypeBooking = {
  id: string;
  ref: string;
  roomNumber: string;
  status: StayStatus;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  guests: { adults: number; children: number };
  guest: PrototypeGuest;
  quote: PrototypeQuote;
  source: "website" | "walk_in" | "phone";
  createdAt: string;
  idempotencyKey?: string;
  pendingExpiresAt?: string;
  approval?: { decidedAt?: string; reason?: string };
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  noShowAt?: string;
  rejectionReason?: string;
  payments: PrototypePayment[];
  documents: PrototypeDocument[];
  unsettledReason?: string;
};

export type RoomBlock = {
  id: string;
  roomNumber: string;
  startAt: string;
  endAt: string;
  reason: string;
  createdAt: string;
};

export type HousekeepingStatus = "clean" | "dirty" | "inspected";

export type AuditEntry = {
  id: string;
  at: string;
  action: string;
  ref?: string;
  roomNumber?: string;
  detail?: string;
};

export type OutboxEntry = {
  id: string;
  channel: "whatsapp" | "email";
  to: string;
  template: string;
  ref: string;
  status: "queued" | "logged";
  createdAt: string;
};

export type CounterMap = Record<string, number>;

export type PrototypeState = {
  version: PrototypeVersion;
  seededAt: string;
  bookings: PrototypeBooking[];
  blocks: RoomBlock[];
  housekeeping: Record<string, HousekeepingStatus>;
  counters: {
    bill: CounterMap;
    receipt: CounterMap;
    invoice: CounterMap;
  };
  audit: AuditEntry[];
  outbox: OutboxEntry[];
};

export type BoardRoomStatus = {
  roomNumber: string;
  category?: RoomCategoryId;
  status: RoomBoardState;
  bookingRef?: string;
  bookingStatus?: StayStatus;
  guestName?: string;
  startAt?: string;
  endAt?: string;
  availableAgainAt?: string;
  pendingExpiresAt?: string;
  tooltip: string;
  shortLine: string;
};

export type BoardPayload = {
  from: string;
  to: string;
  mode: "guest" | "admin";
  counts: Record<RoomBoardState, number>;
  rooms: BoardRoomStatus[];
};
