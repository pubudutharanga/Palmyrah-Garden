import { redirect } from "next/navigation";

/**
 * CR1 has no online payment. Old nightly-booking links to a deposit screen now
 * return the guest to the request status page, where payment is at the counter.
 */
export default async function LegacyDepositPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  redirect(`/booking/${ref.toUpperCase()}`);
}
