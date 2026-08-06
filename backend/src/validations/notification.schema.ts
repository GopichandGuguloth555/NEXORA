import { z } from "zod";

export const markNotificationAsReadSchema = z.object({
  isRead: z.boolean(),
});

export type MarkNotificationAsReadInput = z.infer<
  typeof markNotificationAsReadSchema
>;