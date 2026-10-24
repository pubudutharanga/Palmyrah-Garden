import { handleApi, parseJson } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { enquirySchema } from "@/lib/validators/enquiry";
import { saveEnquiry } from "@/server/services/bookings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`enquiry:${ip}`, 5, 60 * 60_000);
    const body = await parseJson(request, enquirySchema);
    await saveEnquiry(body, ip);
    return { received: true };
  });
}
