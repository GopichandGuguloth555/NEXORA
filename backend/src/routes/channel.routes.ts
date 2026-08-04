import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createChannelController, getChannelsController } from "../controllers/channel.contoller.js";

const router = Router();

router.post("/:workspaceId/channels",authMiddleware,createChannelController);
router.get("/:workspaceId/channels",authMiddleware,getChannelsController);


export default router;