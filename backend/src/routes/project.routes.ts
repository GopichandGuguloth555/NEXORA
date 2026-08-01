import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {createProjectController,getProjectsController,getProjectByIdController,updateProjectController,deleteProjectController,
} from "../controllers/project.controller.js";

const router = Router();

router.post("/:workspaceId/projects", authMiddleware, createProjectController);
router.get("/:workspaceId/projects", authMiddleware, getProjectsController);
router.get("/projects/:projectId", authMiddleware, getProjectByIdController);
router.patch("/projects/:projectId", authMiddleware, updateProjectController);
router.delete("/projects/:projectId",authMiddleware,deleteProjectController);

export default router;