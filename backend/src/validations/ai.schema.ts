import { z } from "zod";

export const generatePlanSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe your project idea in at least 10 characters")
    .max(2000, "Prompt is too long (max 2000 characters)"),
  workspaceId: z.string().optional(),
});

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;

export const aiAssistantSchema = z.object({
  prompt: z.string().min(2, "Prompt is too short"),
  context: z.string().optional(),
});

export type AIAssistantInput = z.infer<typeof aiAssistantSchema>;
