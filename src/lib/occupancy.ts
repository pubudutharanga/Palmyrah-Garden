import type { QuoteRoomInput } from "@/lib/types";

export type RoomSlot = {
  roomTypeId: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
};

export type OccupancyResult =
  | { ok: true; rooms: QuoteRoomInput[] }
  | { ok: false; message: string };

/**
 * Distributes a whole-party headcount across the rooms the guest selected.
 * Every room needs one adult; extra adults and children fill rooms in order.
 */
export function distributeGuests(
  slots: RoomSlot[],
  adults: number,
  children: number,
): OccupancyResult {
  if (slots.length === 0) {
    return { ok: false, message: "Choose at least one room." };
  }
  if (adults < slots.length) {
    return {
      ok: false,
      message: `Each room needs at least one adult. Choose ${adults === 1 ? "one room" : `${adults} rooms or fewer`}.`,
    };
  }
  if (adults > slots.reduce((sum, slot) => sum + slot.maxAdults, 0)) {
    return {
      ok: false,
      message: "That many adults will not fit in the rooms you chose.",
    };
  }
  if (children > slots.reduce((sum, slot) => sum + slot.maxChildren, 0)) {
    return {
      ok: false,
      message: "That many children will not fit in the rooms you chose.",
    };
  }

  const rooms: QuoteRoomInput[] = slots.map((slot) => ({
    roomTypeId: slot.roomTypeId,
    adults: 1,
    children: 0,
  }));

  let remainingAdults = adults - slots.length;
  for (let index = 0; index < slots.length && remainingAdults > 0; index += 1) {
    const capacity = slots[index].maxAdults - 1;
    const take = Math.min(capacity, remainingAdults);
    rooms[index].adults += take;
    remainingAdults -= take;
  }

  let remainingChildren = children;
  for (let index = 0; index < slots.length && remainingChildren > 0; index += 1) {
    const roomOccupancy = rooms[index].adults;
    const occupancyLeft = slots[index].maxOccupancy - roomOccupancy;
    const take = Math.min(
      slots[index].maxChildren,
      occupancyLeft,
      remainingChildren,
    );
    if (take > 0) {
      rooms[index].children += take;
      remainingChildren -= take;
    }
  }

  if (remainingAdults > 0) {
    return { ok: false, message: "That many guests will not fit in the rooms you chose." };
  }
  if (remainingChildren > 0) {
    return { ok: false, message: "That many guests will not fit in the rooms you chose." };
  }

  return { ok: true, rooms };
}
