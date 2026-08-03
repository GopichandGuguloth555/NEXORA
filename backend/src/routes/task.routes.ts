import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTaskController, getTaskByIdController, getTasksController, updateTaskController } from "../controllers/task.controller.js";

const router = Router();

router.post("/:projectId/tasks",authMiddleware,createTaskController);
router.get("/:projectId/tasks",authMiddleware,getTasksController);
router.get("/tasks/:taskId", authMiddleware, getTaskByIdController);
router.patch("/tasks/:taskId", authMiddleware,updateTaskController);

export default router;