import { z } from "zod";

import { emailSchema, phoneSchema } from "@/lib/validators/common";

export const enquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(80, "Keep your name under 80 characters."),
    email: emailSchema,
    phone: phoneSchema,
    topic: z.enum(["stay", "group", "other"]),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more — at least 10 characters.")
      .max(2000, "Keep your message under 2,000 characters."),
    website: z.string().max(0, "Leave this field empty.").optional(),
  })
  .strict();

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const subscriberSchema = z
  .object({
    email: emailSchema,
    consent: z.literal(true, {
      message: "Please confirm you would like to hear from us.",
    }),
    source: z.string().trim().max(40).optional().default("footer"),
    website: z.string().max(0, "Leave this field empty.").optional(),
  })
  .strict();

export type SubscriberInput = z.infer<typeof subscriberSchema>;
