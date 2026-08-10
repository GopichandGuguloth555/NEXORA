import type { Request, Response } from "express";
import { uploadFile } from "../services/ upload.service.js";

export const uploadFileController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await uploadFile(req.file);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "File upload failed",
    });
  }
};