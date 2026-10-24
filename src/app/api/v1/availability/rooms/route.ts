import { handleApi, parseQuery } from "@/server/lib/api";
import { takeRateLimit } from "@/server/lib/take-rate-limit";
import { roomMapSchema } from "@/lib/validators/stay";
import { getRoomMap } from "@/server/services/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleApi(request, async ({ ip }) => {
    takeRateLimit(`room-map:${ip}`, 60, 60_000);
    const query = parseQuery(request, roomMapSchema);
    const rooms = await getRoomMap(query);
    return {
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      rooms,
    };
  });
}
