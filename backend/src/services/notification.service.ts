import prisma from "../config/prisma.js";
import type { MarkNotificationAsReadInput } from "../validations/notification.schema.js";
import { NotificationType } from "../generated/prisma/client.js";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
}

export const createNotification = async ({userId,type,title,message,entityId,}: CreateNotificationInput) => {

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      entityId,
    },
  });

  return notification;
};

export const getNotifications = async (userId: string) => {

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
};

export const markNotificationAsRead = async (notificationId: string, data: MarkNotificationAsReadInput,userId: string) => {

  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      isRead: data.isRead,
    },
  });

  return updatedNotification;
};

export const deleteNotification = async (notificationId: string,userId: string) => {
    
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const deletedNotification = await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return deletedNotification;
};