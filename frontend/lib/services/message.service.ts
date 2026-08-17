import { api } from "../api";
import { ApiResponse, Message } from "../types";

export const messageService = {
  async getMessages(channelId: string): Promise<ApiResponse<Message[]>> {
    const res = await api.get<ApiResponse<Message[]>>(`/channels/${channelId}/messages`);
    return res.data;
  },

  async createMessage(channelId: string, content: string): Promise<ApiResponse<Message>> {
    const res = await api.post<ApiResponse<Message>>(`/channels/${channelId}/messages`, { content });
    return res.data;
  },

  async updateMessage(channelId: string, messageId: string, content: string): Promise<ApiResponse<Message>> {
    const res = await api.patch<ApiResponse<Message>>(`/channels/${channelId}/messages/${messageId}`, { content });
    return res.data;
  },

  async deleteMessage(channelId: string, messageId: string): Promise<ApiResponse<Message>> {
    const res = await api.delete<ApiResponse<Message>>(`/channels/${channelId}/messages/${messageId}`);
    return res.data;
  },
};
