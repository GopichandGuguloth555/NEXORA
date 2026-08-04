import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long"),

  description: z
    .string()
    .max(100, "Description is too long")
    .optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long"),

  description: z
    .string()
    .max(100, "Description is too long")
    .optional(),
});

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;