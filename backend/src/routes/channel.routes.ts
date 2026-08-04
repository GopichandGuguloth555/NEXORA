import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createChannelController, deleteChannelController, getChannelByIDController, getChannelsController, updateChannelController } from "../controllers/channel.contoller.js";

const router = Router();

router.post("/:workspaceId/channels",authMiddleware,createChannelController);
router.get("/:workspaceId/channels",authMiddleware,getChannelsController);
router.get("/:workspaceId/channels/:channelId", authMiddleware,getChannelByIDController);
router.patch("/:workspaceId/channels/:channelId",authMiddleware,updateChannelController);
router.delete("/:workspaceId/channels/:channelId",authMiddleware,deleteChannelController);


export default router;