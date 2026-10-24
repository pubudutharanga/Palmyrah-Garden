import type { Metadata } from "next";

import { DocumentScreen } from "@/components/documents/document-views";

export const metadata: Metadata = {
  title: "Your document",
  robots: { index: false, follow: false },
};

export default async function GuestDocumentPage({
  params,
}: {
  params: Promise<{ ref: string; number: string }>;
}) {
  const { ref, number } = await params;
  return (
    <DocumentScreen
      number={number}
      bookingRef={ref.toUpperCase()}
      backHref={`/booking/${ref.toUpperCase()}`}
      backLabel="Back to your request"
    />
  );
}
