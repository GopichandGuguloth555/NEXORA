import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMessageController, getMessageByIDController, getMessgesController } from "../controllers/message.controller.js";

const router = Router();

router.post("/:channelId/messages",authMiddleware,createMessageController);
router.get("/:channelId/messages/",authMiddleware,getMessgesController);
router.get("/:channelId/messages/:messageId",authMiddleware,getMessageByIDController);


export default router;