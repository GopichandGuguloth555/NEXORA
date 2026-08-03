import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTaskController, getTasksController } from "../controllers/task.controller.js";

const router = Router();

router.post("/:projectId/tasks",authMiddleware,createTaskController);
router.get("/:projectId/tasks",authMiddleware,getTasksController);

export default router;