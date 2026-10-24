/**
 * Creates the indexes that make overlapping bookings impossible.
 * Usage: pnpm db:indexes
 */
import mongoose from "mongoose";

import { connectDb } from "@/server/db/connect";
import {
  BookingModel,
  EnquiryModel,
  RoomNightModel,
  SubscriberModel,
} from "@/server/db/models";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Add it to .env.local (or the shell) before creating indexes.",
    );
    process.exitCode = 1;
    return;
  }

  await connectDb();
  await Promise.all([
    BookingModel.init(),
    RoomNightModel.init(),
    EnquiryModel.init(),
    SubscriberModel.init(),
  ]);
  console.log("MongoDB indexes are ready.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
  await mongoose.disconnect().catch(() => undefined);
});
