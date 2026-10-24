/**
 * CR1 prototype settings.
 *
 * Rates are sample values, split by room category — TODO(client).
 * AC = 34 rooms, Non-AC = 12 rooms in the local prototype split.
 */

import type { RoomCategoryId } from "@/content/room-board";

export const PROTOTYPE_STORE_KEY = "palmyrah.prototype.state";
export const PROTOTYPE_STORE_VERSION = 1;

export const ROOM_BOARD_COLUMNS = 9;

export type RoomCategoryRate = {
  ratePer24h: number;
  ratePerHour: number;
};

export const PROTOTYPE_SETTINGS = {
  stay: {
    slotMinutes: 60,
    turnaroundMinutes: 60,
    minMinutes: 180,
    maxMinutes: 43_200,
    maxAdvanceDays: 180,
    approvalTimeoutMinutes: 120,
    lateArrivalGraceMinutes: 120,
    maxPendingPerPhone: 2,
  },
  pricing: {
    // AC sample: LKR 24,500 per 24 h and LKR 3,200 per extra hour.
    ac: {
      ratePer24h: 2_450_000,
      ratePerHour: 320_000,
    },
    // Non-AC sample: LKR 18,500 per 24 h and LKR 2,500 per extra hour.
    non_ac: {
      ratePer24h: 1_850_000,
      ratePerHour: 250_000,
    },
  } as Record<RoomCategoryId, RoomCategoryRate>,
  tax: {
    serviceChargePercent: 10,
    vatPercent: 18,
  },
} as const;

export const ROOM_STATUS_ORDER = [
  "available",
  "pending",
  "booked",
  "in_house",
  "blocked",
] as const;

export const DEFAULT_HOUSEKEEPING = "clean" as const;
