import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTaskController, deleteTaskController, getTaskByIdController, getTasksController, updateTaskController } from "../controllers/task.controller.js";

const router = Router();

router.post("/:projectId/tasks",authMiddleware,createTaskController);
router.get("/:projectId/tasks",authMiddleware,getTasksController);
router.get("/tasks/:taskId", authMiddleware, getTaskByIdController);
router.patch("/tasks/:taskId", authMiddleware,updateTaskController);
router.delete("/tasks/:taskId",authMiddleware,deleteTaskController);

export default router;