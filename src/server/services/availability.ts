import "server-only";

import { ROOMS, ROOM_TYPES } from "@/content/rooms";
import { diffNights, nightsBetween, type DateKey } from "@/lib/dates";
import type { AvailabilityDay, RoomMapEntry, SearchTypeResult } from "@/lib/types";
import { getStore } from "@/server/store";

export type CalendarResult = {
  total: number;
  types: { id: string; slug: string; name: string; total: number }[];
  days: AvailabilityDay[];
  generatedAt: string;
};

async function occupancyNights(from: DateKey, to: DateKey) {
  const store = getStore();
  return store.occupancy(from, to);
}

function typeTotals(): Map<string, number> {
  const totals = new Map<string, number>();
  for (const type of ROOM_TYPES) totals.set(type.id, 0);
  for (const room of ROOMS) {
    totals.set(room.roomTypeId, (totals.get(room.roomTypeId) ?? 0) + 1);
  }
  return totals;
}

export async function getCalendar(from: DateKey, to: DateKey): Promise<CalendarResult> {
  const rows = await occupancyNights(from, to);
  const totals = typeTotals();
  const occupiedByNight = new Map<DateKey, Set<string>>();

  for (const night of nightsBetween(from, to)) {
    occupiedByNight.set(night, new Set());
  }
  for (const row of rows) {
    occupiedByNight.get(row.night)?.add(row.roomId);
  }

  const roomTypeById = new Map(ROOMS.map((room) => [room.id, room.roomTypeId]));

  const days = [...occupiedByNight.entries()].map(([date, occupied]) => {
    const byType: Record<string, number> = {};
    for (const type of ROOM_TYPES) {
      const total = totals.get(type.id) ?? 0;
      const occupiedOfType = [...occupied].filter(
        (roomId) => roomTypeById.get(roomId) === type.id,
      ).length;
      byType[type.id] = Math.max(0, total - occupiedOfType);
    }
    return {
      date,
      total: ROOMS.length,
      booked: occupied.size,
      held: 0,
      blocked: 0,
      remaining: Math.max(0, ROOMS.length - occupied.size),
      byType,
    };
  });

  return {
    total: ROOMS.length,
    types: ROOM_TYPES.map((type) => ({
      id: type.id,
      slug: type.slug,
      name: type.name,
      total: totals.get(type.id) ?? 0,
    })),
    days,
    generatedAt: new Date().toISOString(),
  };
}

export async function searchStay({
  checkIn,
  checkOut,
}: {
  checkIn: DateKey;
  checkOut: DateKey;
  adults: number;
  children: number;
}): Promise<{ types: SearchTypeResult[]; nights: number }> {
  const nights = diffNights(checkIn, checkOut);
  const rows = await occupancyNights(checkIn, checkOut);
  const occupiedForStay = new Set(rows.map((row) => row.roomId));

  const types = [...ROOM_TYPES]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((type) => {
      const typeRooms = ROOMS.filter((room) => room.roomTypeId === type.id);
      const available = typeRooms.filter((room) => !occupiedForStay.has(room.id)).length;
      return {
        roomTypeId: type.id,
        slug: type.slug,
        name: type.name,
        cover: type.images[0]?.scene ?? "story.garden",
        maxOccupancy: type.maxOccupancy,
        available,
        fromRate: type.baseRate,
        avgNightlyRate: type.baseRate,
        stayTotalBeforeTax: type.baseRate * nights,
      } satisfies SearchTypeResult;
    });

  return { types, nights };
}

export async function getRoomMap({
  checkIn,
  checkOut,
}: {
  checkIn: DateKey;
  checkOut: DateKey;
}): Promise<RoomMapEntry[]> {
  const rows = await occupancyNights(checkIn, checkOut);
  const occupied = new Set(rows.map((row) => row.roomId));
  return ROOMS.map((room) => ({
    id: room.id,
    number: room.number,
    roomTypeId: room.roomTypeId,
    wing: room.wing,
    floor: room.floor,
    state: occupied.has(room.id) ? "unavailable" : "available",
  }));
}

export async function availabilitySignals({
  checkIn,
  checkOut,
  adults,
  children,
}: {
  checkIn: DateKey;
  checkOut: DateKey;
  adults: number;
  children: number;
}) {
  const { types, nights } = await searchStay({ checkIn, checkOut, adults, children });
  return {
    nights,
    guests: adults + children,
    types,
    totalFreeRooms: types.reduce((sum, type) => sum + type.available, 0),
  };
}
