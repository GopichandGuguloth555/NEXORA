import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {getNotificationsController,markNotificationAsReadController,deleteNotificationController,} 
from "../controllers/notification.controller.js";

const router = Router();

router.get("/",authMiddleware,getNotificationsController);
router.patch("/:notificationId/read",authMiddleware,markNotificationAsReadController);
router.delete("/:notificationId",authMiddleware,deleteNotificationController);

export default router;