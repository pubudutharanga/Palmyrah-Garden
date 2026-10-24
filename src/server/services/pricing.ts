import "server-only";

import { ROOM_TYPES } from "@/content/rooms";
import { errors } from "@/server/lib/errors";
import { quoteStay } from "@/lib/pricing";
import type { QuoteInput, Quote } from "@/lib/types";
import type { QuoteRequest } from "@/lib/validators/stay";

const catalog = ROOM_TYPES.map((type) => ({
  id: type.id,
  name: type.name,
  baseRate: type.baseRate,
  maxAdults: type.maxAdults,
  maxChildren: type.maxChildren,
  maxOccupancy: type.maxOccupancy,
}));

export function quoteForStay(input: QuoteInput): Quote {
  for (const room of input.rooms) {
    const type = catalog.find((item) => item.id === room.roomTypeId);
    if (!type) {
      throw errors.validation("One of those room types is no longer available.", {
        fields: [{ field: "rooms", message: "Choose a current room type." }],
      });
    }
    if (room.adults < 1) {
      throw errors.validation("Each room needs at least one adult.");
    }
    if (room.adults > type.maxAdults) {
      throw errors.validation(
        `${type.name} takes up to ${type.maxAdults} adults per room.`,
      );
    }
    if (room.children > type.maxChildren) {
      throw errors.validation(
        `${type.name} takes up to ${type.maxChildren} children per room.`,
      );
    }
    if (room.adults + room.children > type.maxOccupancy) {
      throw errors.validation(
        `${type.name} sleeps up to ${type.maxOccupancy} guests per room.`,
      );
    }
  }

  try {
    return quoteStay(input, { roomTypes: catalog });
  } catch (error) {
    throw errors.validation(
      error instanceof Error ? error.message : "The stay could not be priced.",
    );
  }
}

export function quoteFromRequest(input: QuoteRequest): Quote {
  return quoteForStay({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    mealPlan: input.mealPlan,
    rooms: input.rooms,
  });
}

export { catalog as pricingRoomTypes };
