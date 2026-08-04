import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMessageController } from "../controllers/message.controller.js";

const router = Router();

router.post("/:channelId/messages",authMiddleware,createMessageController);

export default router;