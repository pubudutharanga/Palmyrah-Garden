import "server-only";

import { isMongoConfigured } from "@/server/db/connect";
import { demoStore } from "@/server/store/demo";
import { mongoStore } from "@/server/store/mongo";
import type { BookingStore } from "@/server/store/types";

/** Atlas in production; deterministic demo data when no connection string exists. */
export function getStore(): BookingStore {
  return isMongoConfigured() ? mongoStore : demoStore;
}

export function storeMode(): "demo" | "mongo" {
  return isMongoConfigured() ? "mongo" : "demo";
}
