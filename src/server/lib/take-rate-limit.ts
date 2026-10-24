import "server-only";

import { errors } from "@/server/lib/errors";
import { rateLimit } from "@/server/lib/rate-limit";

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const result = rateLimit({ key, limit, windowMs });
  if (!result.ok) throw errors.rateLimited();
}
