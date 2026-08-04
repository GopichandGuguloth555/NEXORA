import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createChannelController, getChannelByIDController, getChannelsController } from "../controllers/channel.contoller.js";

const router = Router();

router.post("/:workspaceId/channels",authMiddleware,createChannelController);
router.get("/:workspaceId/channels",authMiddleware,getChannelsController);
router.get("/:workspaceId/channels/:channelId", authMiddleware,getChannelByIDController);


export default router;