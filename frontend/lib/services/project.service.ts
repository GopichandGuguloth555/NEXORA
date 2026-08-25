import { api } from "../api";
import { ApiResponse, Project } from "../types";

export const projectService = {
  async getProjects(workspaceId: string): Promise<ApiResponse<Project[]>> {
    const res = await api.get<ApiResponse<Project[]>>(`/workspaces/${workspaceId}/projects`);
    return res.data;
  },

  async createProject(workspaceId: string, data: { name: string; description?: string; emoji?: string }): Promise<ApiResponse<Project>> {
    const res = await api.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, data);
    return res.data;
  },

  async getProjectById(projectId: string): Promise<ApiResponse<Project>> {
    const res = await api.get<ApiResponse<Project>>(`/workspaces/projects/${projectId}`);
    return res.data;
  },

  async updateProject(projectId: string, data: { name?: string; description?: string; emoji?: string }): Promise<ApiResponse<Project>> {
    const res = await api.patch<ApiResponse<Project>>(`/workspaces/projects/${projectId}`, data);
    return res.data;
  },

  async deleteProject(projectId: string): Promise<ApiResponse<Project>> {
    const res = await api.delete<ApiResponse<Project>>(`/workspaces/projects/${projectId}`);
    return res.data;
  },
};
