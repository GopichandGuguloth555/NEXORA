import { z } from "zod";

export const createTaskSchema = z.object({
    
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200),

  description: z
    .string()
    .max(1000)
    .optional(),

  status: z
    .enum(["TODO", "IN_PROGRESS", "DONE"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),

  assigneeId: z
    .string()
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  
  title: z
    .string()
    .min(3)
    .max(200)
    .optional(),

  description: z
    .string()
    .max(1000)
    .optional(),

  status: z
    .enum(["TODO", "IN_PROGRESS", "DONE"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),

  assigneeId: z
    .string()
    .optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;