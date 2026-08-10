import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/  upload.middleware.js";

import {uploadFileController} from "../controllers/upload.controller.js";

const router = Router();

router.post("/",authMiddleware,upload.single("file"),uploadFileController);

export default router;