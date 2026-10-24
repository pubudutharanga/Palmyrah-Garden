import type {
  ChargeType,
  MealPlan,
  PaymentMethod,
} from "@/lib/constants";
import type { DateKey } from "@/lib/dates";

export type QuoteLine = {
  type: ChargeType;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  night?: DateKey;
  roomTypeId?: string;
  roomId?: string;
};

export type TaxLine = {
  code: string;
  label: string;
  percent: number;
  base: number;
  amount: number;
};

export type AppliedDiscount = {
  code?: string;
  offerId?: string;
  label: string;
  kind: "percent" | "fixed";
  value: number;
};

export type QuoteRoomInput = {
  roomTypeId: string;
  roomId?: string;
  adults: number;
  children: number;
};

export type QuoteInput = {
  checkIn: DateKey;
  checkOut: DateKey;
  mealPlan?: MealPlan;
  discount?: AppliedDiscount;
  rooms: QuoteRoomInput[];
};

export type QuoteRoom = {
  roomTypeId: string;
  roomId?: string;
  name: string;
  adults: number;
  children: number;
  nightly: { night: DateKey; rate: number; overrideId?: string }[];
  subtotal: number;
};

export type Quote = {
  currency: "LKR";
  checkIn: DateKey;
  checkOut: DateKey;
  nights: number;
  mealPlan: MealPlan;
  rooms: QuoteRoom[];
  lines: QuoteLine[];
  subtotal: number;
  taxLines: TaxLine[];
  taxTotal: number;
  total: number;
  depositPercent: number;
  depositDue: number;
  quotedAt: string;
};

export type TaxRule = {
  code: string;
  label: string;
  percent: number;
  appliesTo: readonly ChargeType[];
  compoundOn: readonly string[];
  enabled?: boolean;
  order: number;
};

export type NightRateOverride = {
  id: string;
  name: string;
  roomTypeIds: string[];
  from: DateKey;
  to: DateKey;
  daysOfWeek?: number[];
  mode: "percent" | "fixed_delta" | "fixed_rate";
  value: number;
  priority: number;
  enabled: boolean;
};

export type AvailabilityDay = {
  date: DateKey;
  total: number;
  booked: number;
  held: number;
  blocked: number;
  remaining: number;
  byType: Record<string, number>;
};

export type RoomState = "available" | "unavailable";

export type RoomMapEntry = {
  id: string;
  number: string;
  roomTypeId: string;
  wing: string;
  floor: number;
  state: RoomState;
};

export type SearchTypeResult = {
  roomTypeId: string;
  slug: string;
  name: string;
  cover: string;
  maxOccupancy: number;
  available: number;
  fromRate: number;
  avgNightlyRate: number;
  stayTotalBeforeTax: number;
};

export type BookingGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  notes?: string;
};

export type BookingRoom = {
  roomId: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  adults: number;
  children: number;
};

export type BookingStatus =
  | "confirmed"
  | "cancelled"
  | "completed";

export type BookingRecord = {
  ref: string;
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

export type BookingSummary = Omit<BookingRecord, "guest"> & {
  guest: Pick<BookingGuest, "firstName" | "lastName">;
};

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
