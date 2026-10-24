import { handleApi, parseJson } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { bookingRequestSchema } from "@/lib/validators/booking";
import { createBooking } from "@/server/services/bookings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`booking-create:${ip}`, 10, 60_000);
    const body = await parseJson(request, bookingRequestSchema);
    const key = request.headers.get("idempotency-key")?.trim();
    const idempotencyKey =
      key && key.length >= 8 && key.length <= 200 ? key : undefined;
    const { booking, token } = await createBooking(body, idempotencyKey);
    return {
      ref: booking.ref,
      token,
      booking,
    };
  });
}
