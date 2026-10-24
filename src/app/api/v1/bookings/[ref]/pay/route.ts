import { handleApi, parseJson } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { payBookingSchema } from "@/lib/validators/booking";
import { payDeposit } from "@/server/services/bookings";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`booking-pay:${ip}`, 20, 60_000);
    const { ref } = await params;
    const token =
      new URL(request.url).searchParams.get("t") ??
      request.headers.get("x-booking-token");
    const body = await parseJson(request, payBookingSchema);
    return payDeposit(ref.toUpperCase(), token, body.method);
  });
}
