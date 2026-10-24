import "server-only";

import { type MealPlan, type PaymentMethod } from "@/lib/constants";
import { diffNights } from "@/lib/dates";
import { distributeGuests, type RoomSlot } from "@/lib/occupancy";
import { ROOMS, ROOM_TYPE_BY_ID } from "@/content/rooms";
import { errors, RoomUnavailableError } from "@/server/lib/errors";
import {
  bookingLinkSecret,
  generateBookingRef,
  hashIp,
  signToken,
  verifyToken,
} from "@/server/lib/tokens";
import { logger } from "@/server/lib/logger";
import type { BookingRequest } from "@/lib/validators/booking";
import type { BookingRoom, Quote } from "@/lib/types";
import { getStore } from "@/server/store";
import type { EnquiryRecord, StoredBooking } from "@/server/store/types";
import { quoteForStay } from "@/server/services/pricing";
import { searchStay } from "@/server/services/availability";
import type { EnquiryInput, SubscriberInput } from "@/lib/validators/enquiry";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 90;

export function tokenForBooking(ref: string): string {
  return signToken({ ref }, bookingLinkSecret(), TOKEN_TTL_SECONDS);
}

export function requireBookingAccess(ref: string, token: string | null): void {
  if (!token) throw errors.unauthorized();
  const payload = verifyToken<{ ref: string }>(token, bookingLinkSecret());
  if (!payload || payload.ref !== ref) throw errors.unauthorized();
}

function slotsFor(input: BookingRequest): RoomSlot[] {
  const slots: RoomSlot[] = [];
  for (const selection of input.rooms) {
    const type = ROOM_TYPE_BY_ID.get(selection.roomTypeId);
    if (!type) {
      throw errors.validation("One of those room types is not available.", {
        fields: [{ field: "rooms", message: "Choose a current room type." }],
      });
    }
    for (let index = 0; index < selection.quantity; index += 1) {
      slots.push({
        roomTypeId: type.id,
        maxAdults: type.maxAdults,
        maxChildren: type.maxChildren,
        maxOccupancy: type.maxOccupancy,
      });
    }
  }
  return slots;
}

function pickRooms(
  slots: RoomSlot[],
  slotGuests: { adults: number; children: number }[],
  occupied: Set<string>,
): BookingRoom[] {
  const used = new Set<string>();
  const chosen: BookingRoom[] = [];

  for (const [index, slot] of slots.entries()) {
    const type = ROOM_TYPE_BY_ID.get(slot.roomTypeId);
    if (!type) throw new RoomUnavailableError();
    const room = ROOMS.filter((item) => item.roomTypeId === slot.roomTypeId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .find((item) => !occupied.has(item.id) && !used.has(item.id));
    if (!room) throw new RoomUnavailableError();

    used.add(room.id);
    chosen.push({
      roomId: room.id,
      roomNumber: room.number,
      roomTypeId: room.roomTypeId,
      roomTypeName: type.name,
      adults: slotGuests[index]?.adults ?? 1,
      children: slotGuests[index]?.children ?? 0,
    });
  }

  return chosen;
}

async function unavailableDetails(input: BookingRequest) {
  try {
    const { types } = await searchStay({
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      children: input.children,
    });
    return {
      availableByType: types.map((type) => ({
        roomTypeId: type.roomTypeId,
        name: type.name,
        available: type.available,
      })),
      alternatives: types
        .filter((type) => type.roomTypeId !== input.rooms[0]?.roomTypeId)
        .map((type) => ({
          roomTypeId: type.roomTypeId,
          name: type.name,
          available: type.available,
        })),
    };
  } catch {
    return undefined;
  }
}

export async function createBooking(
  input: BookingRequest,
  idempotencyKey?: string,
): Promise<{ booking: StoredBooking; token: string }> {
  const store = getStore();

  if (idempotencyKey) {
    const existing = await store.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      logger.info("booking.idempotent-replay", { ref: existing.ref });
      return { booking: existing, token: tokenForBooking(existing.ref) };
    }
  }

  const slots = slotsFor(input);
  if (slots.length === 0) throw errors.validation("Choose at least one room.");

  const plan = distributeGuests(slots, input.adults, input.children);
  if (!plan.ok) {
    throw errors.validation(plan.message, {
      fields: [{ field: "rooms", message: plan.message }],
    });
  }

  const quote = quoteForStay({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    mealPlan: input.mealPlan,
    rooms: plan.rooms,
  });

  if (quote.rooms.length !== slots.length) {
    throw errors.internal("The room plan could not be priced.");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const occupiedRows = await store.occupancy(input.checkIn, input.checkOut);
    const occupied = new Set(occupiedRows.map((row) => row.roomId));

    let rooms: BookingRoom[];
    try {
      rooms = pickRooms(slots, plan.rooms, occupied);
    } catch (error) {
      lastError = error;
      break;
    }

    const ref = generateBookingRef();
    const quoteWithRooms: Quote = {
      ...quote,
      rooms: quote.rooms.map((room, index) => ({
        ...room,
        roomId: rooms[index]?.roomId,
      })),
    };

    const record: StoredBooking = {
      ref,
      idempotencyKey: idempotencyKey?.slice(0, 200),
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: diffNights(input.checkIn, input.checkOut),
      guest: {
        ...input.guest,
        email: input.guest.email.toLowerCase(),
      },
      rooms,
      mealPlan: input.mealPlan as MealPlan,
      quote: quoteWithRooms,
      status: "confirmed",
      payment: {
        method: input.payment,
        depositPaid: false,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await store.create(record);
      logger.info("booking.created", {
        ref,
        nights: record.nights,
        rooms: rooms.length,
        mode: store.mode,
      });
      return { booking: record, token: tokenForBooking(ref) };
    } catch (error) {
      lastError = error;
      if (error instanceof RoomUnavailableError) continue;
      throw error;
    }
  }

  if (lastError instanceof RoomUnavailableError) {
    throw errors.roomUnavailable(
      "Those rooms were taken while you were booking. Choose another room or different dates.",
      await unavailableDetails(input),
    );
  }
  throw lastError instanceof Error
    ? lastError
    : errors.roomUnavailable("Those rooms are no longer free.");
}

export async function getBooking(
  ref: string,
  token: string | null,
): Promise<StoredBooking> {
  requireBookingAccess(ref, token);
  const booking = await getStore().findByRef(ref);
  if (!booking) throw errors.notFound("We could not find that booking.");
  return booking;
}

export type CancellationResult = {
  booking: StoredBooking;
  freeCancellation: boolean;
  chargeNote: string;
};

export async function cancelBooking(
  ref: string,
  token: string | null,
): Promise<CancellationResult> {
  requireBookingAccess(ref, token);
  const store = getStore();
  const booking = await store.findByRef(ref);
  if (!booking) throw errors.notFound("We could not find that booking.");
  if (booking.status === "cancelled") {
    return {
      booking,
      freeCancellation: true,
      chargeNote: "This booking was already cancelled.",
    };
  }

  const checkInAt = new Date(`${booking.checkIn}T${"14:00"}:00+05:30`);
  const hours = (checkInAt.getTime() - Date.now()) / 3_600_000;
  const freeCancellation = hours >= 72;
  const firstNight = booking.quote.rooms[0]?.nightly[0]?.rate ?? 0;
  const chargeNote = freeCancellation
    ? "No cancellation charge applies."
    : `One night (${firstNight > 0 ? "as quoted" : "as booked"}) may be charged. Reception will confirm.`;

  const updated = await store.cancel(ref);
  if (!updated) throw errors.notFound("We could not find that booking.");

  logger.info("booking.cancelled", {
    ref,
    freeCancellation,
    mode: store.mode,
  });

  return { booking: updated, freeCancellation, chargeNote };
}

export async function payDeposit(
  ref: string,
  token: string | null,
  method: PaymentMethod,
): Promise<StoredBooking> {
  requireBookingAccess(ref, token);
  const booking = await getStore().findByRef(ref);
  if (!booking) throw errors.notFound("We could not find that booking.");
  if (booking.status === "cancelled") {
    throw errors.invalidState("This booking has been cancelled.");
  }
  const updated = await getStore().markDepositPaid(ref, method);
  if (!updated) throw errors.notFound("We could not find that booking.");
  return updated;
}

export async function saveEnquiry(
  input: EnquiryInput,
  ip: string,
): Promise<void> {
  const record: EnquiryRecord = {
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    topic: input.topic,
    message: input.message,
    ipHash: hashIp(ip),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await getStore().saveEnquiry(record);
  logger.info("enquiry.received", { topic: input.topic, mode: getStore().mode });
}

export async function saveSubscriber(input: SubscriberInput): Promise<void> {
  const store = getStore();
  await store.saveSubscriber(input.email.toLowerCase(), input.source);
}
