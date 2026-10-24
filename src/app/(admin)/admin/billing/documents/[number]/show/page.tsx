import type { Metadata } from "next";

import { DocumentScreen } from "@/components/documents/document-views";

export const metadata: Metadata = {
  title: "Document",
  robots: { index: false, follow: false },
};

export default async function ShowDocumentPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return (
    <DocumentScreen
      number={number}
      backHref="/admin/bookings/history"
      backLabel="Booking history"
    />
  );
}
