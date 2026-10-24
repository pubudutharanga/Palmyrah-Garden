import { addDays, todayKey, type DateKey } from "@/lib/dates";

export type StaySelection = {
  checkIn?: DateKey;
  checkOut?: DateKey;
  adults: number;
  children: number;
  rooms: number;
  roomType?: string;
};

export const DEFAULT_STAY: StaySelection = {
  adults: 2,
  children: 0,
  rooms: 1,
};

export function guestSummary(adults: number, children: number): string {
  const parts = [`${adults} ${adults === 1 ? "adult" : "adults"}`];
  if (children > 0) {
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  }
  return parts.join(", ");
}

export function roomSummary(rooms: number): string {
  return `${rooms} ${rooms === 1 ? "room" : "rooms"}`;
}

export function bookingHref(selection: StaySelection): string {
  const params = new URLSearchParams();
  if (selection.checkIn) params.set("checkIn", selection.checkIn);
  if (selection.checkOut) params.set("checkOut", selection.checkOut);
  params.set("adults", String(selection.adults));
  params.set("children", String(selection.children));
  params.set("rooms", String(selection.rooms));
  if (selection.roomType) params.set("roomType", selection.roomType);
  return `/book?${params.toString()}`;
}

export function quickStay(nights = 2): { checkIn: DateKey; checkOut: DateKey } {
  const checkIn = addDays(todayKey(), 1);
  return { checkIn, checkOut: addDays(checkIn, nights) };
}
