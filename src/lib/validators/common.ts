import { z } from "zod";

import { isDateKey } from "@/lib/dates";

export const dateKeySchema = z
  .string()
  .refine((value) => isDateKey(value), "Choose a real date.");

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "That identifier is not valid.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email address is too long.")
  .email("Enter an email address like name@example.com.");

export const phoneSchema = z
  .string()
  .trim()
  .max(32, "That phone number is too long.")
  .regex(/^[+()\d\s-]*$/, "Use only digits, spaces, brackets, + or -.")
  .optional();
