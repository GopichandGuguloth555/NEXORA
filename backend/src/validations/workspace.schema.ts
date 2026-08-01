import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(100, "Workspace name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export const inviteSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  role: z.enum(["ADMIN", "MEMBER"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type UpdateMemberRoleInput = z.infer<
  typeof updateMemberRoleSchema
>;