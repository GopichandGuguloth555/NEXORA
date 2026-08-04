import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCommentController, getCommentsController } from "../controllers/comment.controller.js";

const router = Router();

router.post("/:taskId/comments",authMiddleware,createCommentController);
router.get("/:taskId/comments",authMiddleware,getCommentsController);

export default router;