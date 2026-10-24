import { handleApi } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { cancelBooking } from "@/server/services/bookings";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`booking-cancel:${ip}`, 10, 60_000);
    const { ref } = await params;
    const token =
      new URL(request.url).searchParams.get("t") ??
      request.headers.get("x-booking-token");
    return cancelBooking(ref.toUpperCase(), token);
  });
}
