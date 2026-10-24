import type { Metadata } from "next";

import { BookingHistory } from "@/components/admin/booking-history";

export const metadata: Metadata = {
  title: "Booking history",
};

export default function BookingHistoryPage() {
  return <BookingHistory />;
}
