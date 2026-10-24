import { z } from "zod";

import { STAY } from "@/lib/constants";
import { addDays, diffNights, formatDisplay, todayKey, type DateKey } from "@/lib/dates";
import { dateKeySchema } from "@/lib/validators/common";

const baseStay = {
  checkIn: dateKeySchema,
  checkOut: dateKeySchema,
};

function validateStay(
  value: { checkIn: DateKey; checkOut: DateKey },
  context: z.RefinementCtx,
  now = new Date(),
) {
  const today = todayKey(now);
  if (value.checkIn < today) {
    context.addIssue({
      code: "custom",
      path: ["checkIn"],
      message: "Choose a check-in date from today onwards.",
    });
    return;
  }

  const nights = diffNights(value.checkIn, value.checkOut);
  if (nights < STAY.minNights) {
    context.addIssue({
      code: "custom",
      path: ["checkOut"],
      message: `Choose a check-out date after ${formatDisplay(value.checkIn)}.`,
    });
    return;
  }

  if (nights > STAY.maxNights) {
    context.addIssue({
      code: "custom",
      path: ["checkOut"],
      message: `Stays are limited to ${STAY.maxNights} nights.`,
    });
  }

  const lastBookable = addDays(today, STAY.maxAdvanceDays);
  if (value.checkOut > lastBookable) {
    context.addIssue({
      code: "custom",
      path: ["checkOut"],
      message: `Bookings open up to ${STAY.maxAdvanceDays} days ahead. Choose a date before ${formatDisplay(lastBookable)}.`,
    });
  }
}

export const stayQuerySchema = z
  .object({
    ...baseStay,
    adults: z.coerce
      .number()
      .int("Choose a whole number of adults.")
      .min(1, "At least one adult is needed.")
      .max(6, "Book up to 6 adults online."),
    children: z.coerce
      .number()
      .int("Choose a whole number of children.")
      .min(0)
      .max(4, "Book up to 4 children online."),
    rooms: z.coerce
      .number()
      .int("Choose a whole number of rooms.")
      .min(1, "Choose at least one room.")
      .max(5, "Book up to 5 rooms online."),
    roomType: z.string().trim().max(64).optional(),
  })
  .strict()
  .superRefine((value, context) => validateStay(value, context));

export const availabilityQuerySchema = z
  .object({
    from: dateKeySchema,
    to: dateKeySchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (diffNights(value.from, value.to) < 1) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "Choose an end date after the start date.",
      });
    }
    if (diffNights(value.from, value.to) > 124) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "Show at most four months at a time.",
      });
    }
    if (value.from < todayKey() && diffNights(value.from, todayKey()) > 1) {
      context.addIssue({
        code: "custom",
        path: ["from"],
        message: "Choose a date from today onwards.",
      });
    }
  });

export const searchStaySchema = z
  .object({
    ...baseStay,
    adults: z.coerce.number().int().min(1).max(12),
    children: z.coerce.number().int().min(0).max(8),
  })
  .strict()
  .superRefine((value, context) => validateStay(value, context));

export const roomMapSchema = z
  .object(baseStay)
  .strict()
  .superRefine((value, context) => validateStay(value, context));

export const quoteRequestSchema = z
  .object({
    ...baseStay,
    mealPlan: z.enum(["RO", "BB", "HB", "FB"]).optional(),
    rooms: z
      .array(
        z
          .object({
            roomTypeId: z.string().trim().min(1),
            roomId: z.string().trim().min(1).optional(),
            adults: z.number().int().min(1).max(6),
            children: z.number().int().min(0).max(4),
          })
          .strict(),
      )
      .min(1, "Choose at least one room.")
      .max(5, "Quote up to 5 rooms at a time."),
  })
  .strict()
  .superRefine((value, context) => validateStay(value, context));

export type StayQuery = z.infer<typeof stayQuerySchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
