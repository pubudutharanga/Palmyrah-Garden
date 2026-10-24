import type { BookingRecord } from "@/lib/types";

type CachedBooking = {
  booking: BookingRecord;
  token?: string;
  savedAt: string;
};

const prefix = "pgr:booking:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberBooking(
  ref: string,
  booking: BookingRecord,
  token?: string,
): void {
  const store = storage();
  if (!store) return;
  try {
    const value: CachedBooking = {
      booking,
      token,
      savedAt: new Date().toISOString(),
    };
    store.setItem(`${prefix}${ref.toUpperCase()}`, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full. The server remains the source of truth.
  }
}

export function recallBooking(ref: string): CachedBooking | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(`${prefix}${ref.toUpperCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedBooking>;
    if (!parsed?.booking || typeof parsed.booking.ref !== "string") return null;
    return {
      booking: parsed.booking,
      token: parsed.token,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
