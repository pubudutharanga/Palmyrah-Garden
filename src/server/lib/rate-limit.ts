import "server-only";

type Bucket = { count: number; resetAt: number };

const globalForLimits = globalThis as typeof globalThis & {
  __palmyrahRateLimits?: Map<string, Bucket>;
};

const buckets =
  globalForLimits.__palmyrahRateLimits ??
  (globalForLimits.__palmyrahRateLimits = new Map<string, Bucket>());

/**
 * In-memory sliding window. This is per serverless instance, so it is a
 * deterrent rather than a hard guarantee. Swap for Upstash Redis when the
 * prototype goes live.
 */
export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
