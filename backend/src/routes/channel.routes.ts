import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createChannelController } from "../controllers/channel.contoller.js";

const router = Router();

router.post("/:workspaceId/channels",authMiddleware,createChannelController);


export default router;