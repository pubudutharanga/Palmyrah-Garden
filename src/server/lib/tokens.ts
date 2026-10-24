import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingRef(): string {
  let value = "";
  for (let index = 0; index < 6; index += 1) {
    value += REF_ALPHABET[randomInt(0, REF_ALPHABET.length)];
  }
  return `PGR-${value}`;
}

export function bookingLinkSecret(): string {
  return (
    process.env.BOOKING_LINK_SECRET ??
    "palmyrah-prototype-booking-link-secret-change-before-launch"
  );
}

export function hashIp(ip: string): string {
  return createHmac("sha256", bookingLinkSecret()).update(ip).digest("hex");
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function signToken(
  payload: Record<string, unknown>,
  secret: string,
  ttlSeconds: number,
): string {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const encoded = base64url(JSON.stringify(body));
  const signature = createHmac("sha256", secret).update(encoded).digest();
  return `${encoded}.${base64url(signature)}`;
}

export function verifyToken<T extends Record<string, unknown>>(
  token: string,
  secret: string,
): (T & { exp: number }) | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, provided] = parts;
  const expected = base64url(
    createHmac("sha256", secret).update(encoded).digest(),
  );
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString(
        "utf8",
      ),
    ) as T & { exp?: number };
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload as T & { exp: number };
  } catch {
    return null;
  }
}
