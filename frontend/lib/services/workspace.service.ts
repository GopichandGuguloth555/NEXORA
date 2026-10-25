import { api } from "../api";
import { ApiResponse, Role, Workspace, WorkspaceMember, WorkspaceInvitation } from "../types";

export const workspaceService = {
  async getAllWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    const res = await api.get<ApiResponse<Workspace[]>>("/workspaces");
    return res.data;
  },

  async createWorkspace(data: { name: string; description?: string }): Promise<ApiResponse<Workspace>> {
    const res = await api.post<ApiResponse<Workspace>>("/workspaces", data);
    return res.data;
  },

  async updateWorkspace(workspaceId: string, data: { name?: string; description?: string }): Promise<ApiResponse<Workspace>> {
    const res = await api.patch<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, data);
    return res.data;
  },

  async deleteWorkspace(workspaceId: string): Promise<ApiResponse<Workspace>> {
    const res = await api.delete<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`);
    return res.data;
  },

  async getMembers(workspaceId: string): Promise<ApiResponse<WorkspaceMember[]>> {
    const res = await api.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${workspaceId}/members`);
    return res.data;
  },

  async inviteMember(workspaceId: string, data: { email: string; role?: Role }): Promise<ApiResponse<WorkspaceInvitation>> {
    const res = await api.post<ApiResponse<WorkspaceInvitation>>(`/workspaces/${workspaceId}/members`, data);
    return res.data;
  },

  async getPendingInvitations(workspaceId: string): Promise<ApiResponse<WorkspaceInvitation[]>> {
    const res = await api.get<ApiResponse<WorkspaceInvitation[]>>(`/workspaces/${workspaceId}/invitations`);
    return res.data;
  },

  async acceptInvitation(invitationId: string): Promise<ApiResponse<unknown>> {
    const res = await api.post<ApiResponse<unknown>>(`/workspaces/invitations/${invitationId}/accept`, {});
    return res.data;
  },

  async rejectInvitation(invitationId: string): Promise<ApiResponse<unknown>> {
    const res = await api.post<ApiResponse<unknown>>(`/workspaces/invitations/${invitationId}/reject`, {});
    return res.data;
  },

  async cancelInvitation(invitationId: string): Promise<ApiResponse<unknown>> {
    const res = await api.post<ApiResponse<unknown>>(`/workspaces/invitations/${invitationId}/cancel`, {});
    return res.data;
  },

  async getReceivedInvitations(): Promise<ApiResponse<WorkspaceInvitation[]>> {
    const res = await api.get<ApiResponse<WorkspaceInvitation[]>>(`/workspaces/invitations/received`);
    return res.data;
  },

  async removeMember(workspaceId: string, memberId: string): Promise<ApiResponse<WorkspaceMember>> {
    const res = await api.delete<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${memberId}`);
    return res.data;
  },

  async updateMemberRole(workspaceId: string, memberId: string, role: Role): Promise<ApiResponse<WorkspaceMember>> {
    const res = await api.patch<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${memberId}`, { role });
    return res.data;
  },
};
