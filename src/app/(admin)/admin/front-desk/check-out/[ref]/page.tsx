import type { Metadata } from "next";

import { CheckoutFolio } from "@/components/admin/checkout-folio";

export const metadata: Metadata = {
  title: "Check-out folio",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <CheckoutFolio reference={ref.toUpperCase()} />;
}
