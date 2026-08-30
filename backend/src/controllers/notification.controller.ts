import { getParamString } from "../utils/params.js";
import type { Request, Response } from "express";
import { markNotificationAsReadSchema } from "../validations/notification.schema.js";
import {getNotifications,markNotificationAsRead,deleteNotification,} from "../services/notification.service.js";

export const getNotificationsController = async (req: Request,res: Response) => {

  try {
    const notifications = await getNotifications(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully!",
      data: notifications,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const markNotificationAsReadController = async (req: Request,res: Response) => {

  try {
    const data = markNotificationAsReadSchema.parse(req.body);

    const notification = await markNotificationAsRead(
      getParamString(req, "notificationId"),
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully!",
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const deleteNotificationController = async (req: Request,res: Response) => {

  try {
    const notification = await deleteNotification(
      getParamString(req, "notificationId"),
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully!",
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};