import { api } from "../api";
import { ApiResponse, NotificationItem } from "../types";

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    const res = await api.get<ApiResponse<NotificationItem[]>>("/notifications");
    return res.data;
  },

  async markAsRead(notificationId: string, isRead: boolean = true): Promise<ApiResponse<NotificationItem>> {
    const res = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${notificationId}/read`, { isRead });
    return res.data;
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<NotificationItem>> {
    const res = await api.delete<ApiResponse<NotificationItem>>(`/notifications/${notificationId}`);
    return res.data;
  },
};
