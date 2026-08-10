import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/  upload.middleware.js";

import {uploadFileController, getFilesController, getFileByIdController, deleteFileController,} from "../controllers/upload.controller.js";

const router = Router();

router.post("/",authMiddleware,upload.single("file"),uploadFileController);
router.get("/",authMiddleware,getFilesController);
router.get("/:id",authMiddleware,getFileByIdController);
router.delete("/:id",authMiddleware,deleteFileController);

export default router;