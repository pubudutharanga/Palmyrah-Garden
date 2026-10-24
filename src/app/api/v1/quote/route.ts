import { handleApi, parseJson } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { quoteRequestSchema } from "@/lib/validators/stay";
import { quoteFromRequest } from "@/server/services/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`quote:${ip}`, 60, 60_000);
    const body = await parseJson(request, quoteRequestSchema);
    return quoteFromRequest(body);
  });
}
