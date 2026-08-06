import { z } from "zod";

export const createDocumentSchema = z.object({
    
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),

  content: z
    .string()
    .min(1, "Content cannot be empty"),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long")
    .optional(),

  content: z
    .string()
    .min(1, "Content cannot be empty")
    .optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;