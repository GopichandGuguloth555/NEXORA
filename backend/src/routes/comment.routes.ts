import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCommentController, deleteCommentController, getCommentsController, updateCommentController } from "../controllers/comment.controller.js";

const router = Router();

router.post("/:taskId/comments",authMiddleware,createCommentController);
router.get("/:taskId/comments",authMiddleware,getCommentsController);
router.patch("/:taskId/comments/:commentId", authMiddleware,updateCommentController);
router.delete("/:taskId/comments/:commentId", authMiddleware,deleteCommentController);

export default router;