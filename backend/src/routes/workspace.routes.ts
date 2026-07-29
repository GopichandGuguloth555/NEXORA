import { Router } from "express";
import { create, deleteworkspace } from "../controllers/workspace.controller.js";
import { getAllWorkspaces,update } from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { updateWorkspaceSchema} from "../validations/workspace.schema.js";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware,getAllWorkspaces);
router.patch("/:workspaceId", authMiddleware, update);
router.delete("/:workspaceId",authMiddleware, deleteworkspace);

export default router;