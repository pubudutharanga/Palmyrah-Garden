import "server-only";

import { ROOMS } from "@/content/rooms";
import { addDays, diffNights, nightsBetween, type DateKey } from "@/lib/dates";

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A stable cast of "other guests" so the demo has believable availability
 * before MongoDB is connected. Generation is deterministic per calendar date,
 * so every serverless instance returns the same picture.
 */
export function demoOccupiedByNight(
  from: DateKey,
  to: DateKey,
): Map<DateKey, Set<string>> {
  const result = new Map<DateKey, Set<string>>();
  const nights = nightsBetween(from, to);
  for (const night of nights) result.set(night, new Set());

  const span = diffNights(from, to);
  if (span < 1) return result;

  const lastStart = addDays(to, -1);
  const firstStart = addDays(from, -3);
  const days = diffNights(firstStart, lastStart) + 1;

  for (let offset = 0; offset < days; offset += 1) {
    const startDay = addDays(firstStart, offset);
    const random = mulberry32(hashString(`palmyrah:${startDay}`));
    const bookingCount = 3 + Math.floor(random() * 3);

    for (let booking = 0; booking < bookingCount; booking += 1) {
      const startOffset = -Math.floor(random() * 4);
      const stayStart = addDays(startDay, startOffset);
      const length = 1 + Math.floor(random() * 3);
      const roomCount = random() < 0.35 ? 2 : 1;
      const used = new Set<number>();

      for (let roomIndex = 0; roomIndex < roomCount; roomIndex += 1) {
        let index = Math.floor(random() * ROOMS.length);
        while (used.has(index)) index = (index + 1) % ROOMS.length;
        used.add(index);
        const room = ROOMS[index];

        for (let nightIndex = 0; nightIndex < length; nightIndex += 1) {
          const night = addDays(stayStart, nightIndex);
          const slot = result.get(night);
          if (slot) slot.add(room.id);
        }
      }
    }
  }

  return result;
}

export function demoOccupiedRoomIds(from: DateKey, to: DateKey): Set<string> {
  const byNight = demoOccupiedByNight(from, to);
  const roomIds = new Set<string>();
  for (const set of byNight.values()) {
    for (const roomId of set) roomIds.add(roomId);
  }
  return roomIds;
}
