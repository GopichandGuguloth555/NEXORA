import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCommentController, getCommentsController, updateCommentController } from "../controllers/comment.controller.js";

const router = Router();

router.post("/:taskId/comments",authMiddleware,createCommentController);
router.get("/:taskId/comments",authMiddleware,getCommentsController);
router.patch("/:taskId/comments/:commentId", authMiddleware,updateCommentController)

export default router;