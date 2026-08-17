import { api } from "../api";
import { ApiResponse, Channel } from "../types";

export const channelService = {
  async getChannels(workspaceId: string): Promise<ApiResponse<Channel[]>> {
    const res = await api.get<ApiResponse<Channel[]>>(`/workspaces/${workspaceId}/channels`);
    return res.data;
  },

  async createChannel(workspaceId: string, data: { name: string; description?: string }): Promise<ApiResponse<Channel>> {
    const res = await api.post<ApiResponse<Channel>>(`/workspaces/${workspaceId}/channels`, data);
    return res.data;
  },

  async getChannelById(workspaceId: string, channelId: string): Promise<ApiResponse<Channel>> {
    const res = await api.get<ApiResponse<Channel>>(`/workspaces/${workspaceId}/channels/${channelId}`);
    return res.data;
  },

  async updateChannel(
    workspaceId: string,
    channelId: string,
    data: { name?: string; description?: string }
  ): Promise<ApiResponse<Channel>> {
    const res = await api.patch<ApiResponse<Channel>>(`/workspaces/${workspaceId}/channels/${channelId}`, data);
    return res.data;
  },

  async deleteChannel(workspaceId: string, channelId: string): Promise<ApiResponse<Channel>> {
    const res = await api.delete<ApiResponse<Channel>>(`/workspaces/${workspaceId}/channels/${channelId}`);
    return res.data;
  },
};
