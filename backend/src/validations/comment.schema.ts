import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  
    content: z.string().min(1, "comment connot be empty ")
             .max(1000,"Comment is too long!" ),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;