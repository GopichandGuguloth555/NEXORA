import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMessageController, deleteMessageController, getMessageByIDController, getMessgesController, updateMessageController } from "../controllers/message.controller.js";

const router = Router();

router.post("/:channelId/messages",authMiddleware,createMessageController);
router.get("/:channelId/messages/",authMiddleware,getMessgesController);
router.get("/:channelId/messages/:messageId",authMiddleware,getMessageByIDController);
router.patch("/:channelId/messages/:messageId",authMiddleware,updateMessageController);
router.delete("/:channelId/messages/:messageId",authMiddleware,deleteMessageController);



export default router;