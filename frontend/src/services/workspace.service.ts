import { api, unwrap } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Workspace, WorkspaceMember } from "@/types/models";

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    return unwrap(
      await api.get<ApiResponse<Workspace[]>>(endpoints.workspaces.root),
    );
  },

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    return unwrap(
      await api.post<ApiResponse<Workspace>>(endpoints.workspaces.root, input),
    );
  },

  async update(
    workspaceId: string,
    input: CreateWorkspaceInput,
  ): Promise<Workspace> {
    return unwrap(
      await api.patch<ApiResponse<Workspace>>(
        endpoints.workspaces.byId(workspaceId),
        input,
      ),
    );
  },

  async members(workspaceId: string): Promise<WorkspaceMember[]> {
    return unwrap(
      await api.get<ApiResponse<WorkspaceMember[]>>(
        endpoints.workspaces.members(workspaceId),
      ),
    );
  },
};
