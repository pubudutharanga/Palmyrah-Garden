import { describe, expect, it } from "vitest";

import { distributeGuests, type RoomSlot } from "@/lib/occupancy";

const garden: RoomSlot = {
  roomTypeId: "garden-room",
  maxAdults: 2,
  maxChildren: 1,
  maxOccupancy: 3,
};

const family: RoomSlot = {
  roomTypeId: "family-suite",
  maxAdults: 4,
  maxChildren: 2,
  maxOccupancy: 6,
};

describe("distributeGuests", () => {
  it("puts one adult in every room first", () => {
    const result = distributeGuests([garden, garden], 3, 0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rooms.map((room) => room.adults)).toEqual([2, 1]);
  });

  it("spreads children across rooms within occupancy", () => {
    const result = distributeGuests([garden, garden], 2, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rooms).toEqual([
      { roomTypeId: "garden-room", adults: 1, children: 1 },
      { roomTypeId: "garden-room", adults: 1, children: 1 },
    ]);
  });

  it("allows a family suite to take six guests", () => {
    const result = distributeGuests([family], 4, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rooms[0]).toEqual({
      roomTypeId: "family-suite",
      adults: 4,
      children: 2,
    });
  });

  it("rejects too many rooms for the adult count", () => {
    expect(distributeGuests([garden, garden], 1, 0)).toMatchObject({ ok: false });
  });

  it("rejects guests who do not fit", () => {
    expect(distributeGuests([garden], 3, 0)).toMatchObject({ ok: false });
    expect(distributeGuests([garden], 2, 2)).toMatchObject({ ok: false });
    expect(distributeGuests([], 1, 0)).toMatchObject({ ok: false });
  });
});
