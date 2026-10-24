import { permanentRedirect } from "next/navigation";

/**
 * The old per-room-type pages belong to the nightly booking model. CR1 has one
 * standard room type and a single live board, so old links go straight there.
 */
export default async function LegacyRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  permanentRedirect("/rooms");
}
