import { handleApi, parseJson } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { subscriberSchema } from "@/lib/validators/enquiry";
import { saveSubscriber } from "@/server/services/bookings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`subscriber:${ip}`, 3, 60 * 60_000);
    const body = await parseJson(request, subscriberSchema);
    await saveSubscriber(body);
    return { subscribed: true };
  });
}
