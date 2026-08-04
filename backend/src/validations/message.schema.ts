import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long"),
});

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;