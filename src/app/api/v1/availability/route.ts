import { handleApi, parseQuery } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { availabilityQuerySchema } from "@/lib/validators/stay";
import { getCalendar } from "@/server/services/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`availability:${ip}`, 120, 60_000);
    const query = parseQuery(request, availabilityQuerySchema);
    return getCalendar(query.from, query.to);
  });
}
