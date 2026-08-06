import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {createDocumentController,getDocumentsController,getDocumentByIdController,updateDocumentController,deleteDocumentController,
} from "../controllers/document.contoller.js";

const router = Router();

router.post("/workspaces/:workspaceId",authMiddleware,createDocumentController);
router.get("/workspaces/:workspaceId",authMiddleware,getDocumentsController);
router.get("/:documentId", authMiddleware, getDocumentByIdController);
router.put("/:documentId",authMiddleware,updateDocumentController);
router.delete("/:documentId",authMiddleware,deleteDocumentController);

export default router;