import type { Metadata } from "next";

import { RequestStatus } from "@/components/booking/request-status";

export const metadata: Metadata = {
  title: "Your room request",
  robots: { index: false, follow: false },
};

export default async function BookingPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <RequestStatus reference={ref.toUpperCase()} />;
}
