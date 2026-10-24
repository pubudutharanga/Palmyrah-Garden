import { handleApi } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { getBooking } from "@/server/services/bookings";

export const dynamic = "force-dynamic";

function tokenFrom(request: Request): string | null {
  return (
    new URL(request.url).searchParams.get("t") ??
    request.headers.get("x-booking-token")
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`booking-read:${ip}`, 60, 60_000);
    const { ref } = await params;
    return getBooking(ref.toUpperCase(), tokenFrom(request));
  });
}
