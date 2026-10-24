import { z } from "zod";

import { STAY } from "@/lib/constants";
import { diffNights, todayKey } from "@/lib/dates";
import { emailSchema, phoneSchema } from "@/lib/validators/common";
import { dateKeySchema } from "@/lib/validators/common";

const guestBase = {
  firstName: z
    .string()
    .trim()
    .min(1, "Enter the guest's first name.")
    .max(60, "Keep the first name under 60 characters."),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter the guest's last name.")
    .max(60, "Keep the last name under 60 characters."),
  email: emailSchema,
  phone: phoneSchema,
  country: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000, "Keep notes under 1,000 characters.").optional(),
};

export const guestDetailsSchema = z.object({
  ...guestBase,
  acceptTerms: z.literal(true, {
    message: "Please accept the booking and cancellation terms.",
  }),
});

export type GuestDetailsInput = z.infer<typeof guestDetailsSchema>;

export const bookingRequestSchema = z
  .object({
    checkIn: dateKeySchema,
    checkOut: dateKeySchema,
    mealPlan: z.enum(["RO", "BB", "HB", "FB"]),
    adults: z.number().int().min(1).max(12),
    children: z.number().int().min(0).max(8),
    rooms: z
      .array(
        z
          .object({
            roomTypeId: z.string().trim().min(1),
            quantity: z.number().int().min(1).max(5),
          })
          .strict(),
      )
      .min(1, "Choose at least one room.")
      .max(5, "Book up to 5 rooms online."),
    guest: z.object(guestBase).strict(),
    payment: z.enum(["pay_at_resort", "deposit"]),
    acceptTerms: z.literal(true),
  })
  .strict()
  .superRefine((value, context) => {
    const nights = diffNights(value.checkIn, value.checkOut);
    if (nights < 1) {
      context.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: "Choose a check-out date after check-in.",
      });
    }
    if (nights > STAY.maxNights) {
      context.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: `Stays are limited to ${STAY.maxNights} nights.`,
      });
    }
    if (value.checkIn < todayKey()) {
      context.addIssue({
        code: "custom",
        path: ["checkIn"],
        message: "Choose a check-in date from today onwards.",
      });
    }
    const totalRooms = value.rooms.reduce((sum, room) => sum + room.quantity, 0);
    if (totalRooms > 5) {
      context.addIssue({
        code: "custom",
        path: ["rooms"],
        message: "Book up to 5 rooms online. For more, send an enquiry.",
      });
    }
    if (value.adults < totalRooms) {
      context.addIssue({
        code: "custom",
        path: ["adults"],
        message: "Each room needs at least one adult.",
      });
    }
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const cancelBookingSchema = z
  .object({
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const payBookingSchema = z
  .object({
    method: z.literal("card"),
  })
  .strict();

export const bookingLookupSchema = z
  .object({
    ref: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^PGR-[A-HJ-NP-Z2-9]{6}$/, "Enter a booking reference like PGR-4K7M2Q."),
    email: emailSchema,
  })
  .strict();
