import { handleApi, parseQuery } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { searchStaySchema } from "@/lib/validators/stay";
import { searchStay } from "@/server/services/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`search:${ip}`, 60, 60_000);
    const query = parseQuery(request, searchStaySchema);
    const result = await searchStay(query);
    return {
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      nights: result.nights,
      types: result.types,
    };
  });
}
