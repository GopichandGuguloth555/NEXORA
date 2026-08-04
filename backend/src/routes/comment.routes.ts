import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCommentController } from "../controllers/comment.controller.js";

const router = Router();

router.post(
  "/:taskId/comments",
  authMiddleware,
  createCommentController
);

export default router;