import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTaskController } from "../controllers/task.controller.js";

const router = Router();

router.post(
  "/:projectId/tasks",
  authMiddleware,
  createTaskController
);

export default router;