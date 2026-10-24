export const BOOKING_STATUS = [
  "held",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
  "expired",
] as const;

export const BOOKING_SOURCE = [
  "website",
  "walk_in",
  "phone",
  "whatsapp",
  "ota",
  "agent",
] as const;

export const ROOM_NIGHT_STATE = ["held", "booked", "blocked"] as const;

export const HOUSEKEEPING_STATUS = [
  "clean",
  "dirty",
  "inspected",
  "out_of_order",
] as const;

export const MEAL_PLAN = ["RO", "BB", "HB", "FB"] as const;

export const CHARGE_TYPE = [
  "ROOM",
  "MEAL_PLAN",
  "FNB",
  "LAUNDRY",
  "SPA",
  "TRANSPORT",
  "EXCURSION",
  "MINIBAR",
  "EXTRA_BED",
  "LATE_CHECKOUT",
  "CANCELLATION_FEE",
  "MISC",
  "DISCOUNT",
] as const;

export const PAYMENT_METHOD = [
  "card",
  "cash",
  "bank_transfer",
  "online",
  "other",
] as const;

export const PAYMENT_KIND = ["deposit", "settlement", "refund"] as const;
export const PAYMENT_STATUS = [
  "pending",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export const INVOICE_TYPE = [
  "PROFORMA",
  "FINAL",
  "CREDIT_NOTE",
  "CANCELLATION",
] as const;

export const ROLE = [
  "owner",
  "manager",
  "reception",
  "housekeeping",
  "accountant",
] as const;

export type BookingStatus = (typeof BOOKING_STATUS)[number];
export type BookingSource = (typeof BOOKING_SOURCE)[number];
export type RoomNightState = (typeof ROOM_NIGHT_STATE)[number];
export type HousekeepingStatus = (typeof HOUSEKEEPING_STATUS)[number];
export type MealPlan = (typeof MEAL_PLAN)[number];
export type ChargeType = (typeof CHARGE_TYPE)[number];
export type PaymentMethod = (typeof PAYMENT_METHOD)[number];
export type PaymentKind = (typeof PAYMENT_KIND)[number];
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export type InvoiceType = (typeof INVOICE_TYPE)[number];
export type Role = (typeof ROLE)[number];

export const RESORT = {
  name: "The Palmyrah Garden & Resort",
  shortName: "Palmyrah Garden",
  referencePrefix: "PGR",
  currency: "LKR",
  timezone: "Asia/Colombo",
  location: "Mannar, Northern Province, Sri Lanka",
} as const;

export const STAY = {
  checkInTime: "14:00",
  checkOutTime: "12:00",
  minNights: 1,
  maxNights: 30,
  maxAdvanceDays: 365,
  holdMinutes: 15,
} as const;

export const TAX_RULES = [
  {
    code: "SC",
    label: "Service charge",
    percent: 10,
    appliesTo: CHARGE_TYPE,
    compoundOn: [] as string[],
    order: 1,
  },
  {
    code: "VAT",
    label: "VAT",
    percent: 18,
    appliesTo: CHARGE_TYPE,
    compoundOn: ["SC"],
    order: 2,
  },
] as const;

export const MEAL_PLANS: Record<
  MealPlan,
  { label: string; shortLabel: string; adultPerNight: number; childPerNight: number }
> = {
  RO: {
    label: "Room only",
    shortLabel: "Room only",
    adultPerNight: 0,
    childPerNight: 0,
  },
  BB: {
    label: "Bed and breakfast",
    shortLabel: "Breakfast",
    adultPerNight: 250_000,
    childPerNight: 125_000,
  },
  HB: {
    label: "Half board",
    shortLabel: "Half board",
    adultPerNight: 550_000,
    childPerNight: 275_000,
  },
  FB: {
    label: "Full board",
    shortLabel: "Full board",
    adultPerNight: 750_000,
    childPerNight: 375_000,
  },
};

export const DEPOSIT_PERCENT = 30;

export const CANCELLATION = {
  freeUntilHoursBeforeCheckIn: 72,
  lateCancelChargeNights: 1,
  noShowChargeNights: "all" as number | "all",
} as const;
