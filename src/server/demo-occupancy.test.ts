import { describe, expect, it } from "vitest";

import { ROOMS } from "@/content/rooms";
import { demoOccupiedByNight, demoOccupiedRoomIds } from "@/server/demo-occupancy";
import type { DateKey } from "@/lib/dates";

const dk = (value: string) => value as DateKey;

describe("demo occupancy", () => {
  it("is deterministic for a date range", () => {
    const first = demoOccupiedByNight(dk("2027-01-10"), dk("2027-01-13"));
    const second = demoOccupiedByNight(dk("2027-01-10"), dk("2027-01-13"));

    expect([...first.keys()]).toEqual(["2027-01-10", "2027-01-11", "2027-01-12"]);
    for (const night of first.keys()) {
      expect([...(first.get(night) ?? [])].sort()).toEqual(
        [...(second.get(night) ?? [])].sort(),
      );
    }
  });

  it("only marks known rooms and leaves space in the demo", () => {
    const known = new Set(ROOMS.map((room) => room.id));
    const byNight = demoOccupiedByNight(dk("2027-02-01"), dk("2027-02-04"));

    for (const occupied of byNight.values()) {
      for (const roomId of occupied) expect(known.has(roomId)).toBe(true);
    }

    const union = demoOccupiedRoomIds(dk("2027-02-01"), dk("2027-02-04"));
    expect(union.size).toBeGreaterThan(0);
    expect(union.size).toBeLessThan(ROOMS.length);
  });

  it("returns an empty map for a zero-night range", () => {
    const byNight = demoOccupiedByNight(dk("2027-03-01"), dk("2027-03-01"));
    expect(byNight.size).toBe(0);
  });
});
