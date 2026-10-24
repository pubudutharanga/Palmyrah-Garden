import type { Metadata } from "next";

import { PrintDocument } from "@/components/documents/document-views";

export const metadata: Metadata = {
  title: "Print document",
  robots: { index: false, follow: false },
};

export default async function PrintDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { number } = await params;
  const query = await searchParams;
  const requested = Array.isArray(query.format) ? query.format[0] : query.format;
  const format = requested === "80mm" ? "thermal" : "a4";

  return (
    <PrintDocument
      number={number}
      format={format}
      backHref={`/admin/billing/documents/${number}/show`}
    />
  );
}
