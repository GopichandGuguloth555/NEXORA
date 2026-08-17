import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { generatePlanController, aiAssistantController } from "../controllers/ai.controller.js";

const router = Router();

router.post("/plan", authMiddleware, generatePlanController);
router.post("/assistant", authMiddleware, aiAssistantController);

export default router;
