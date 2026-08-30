import type { Request, Response } from "express";
import {uploadFile,getFiles,getFileById, deleteFile,} from "../services/ upload.service.js";
import { getParamString } from "../utils/params.js";


export const uploadFileController = async ( req: Request,res: Response) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user!.id;

    const workspaceId = req.body.workspaceId;

    const file = await uploadFile(
      req.file,
      userId,
      workspaceId
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: file,
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

export const getFilesController = async (req: Request,res: Response) => {

  try {
    const userId = req.user!.id;

    const workspaceId =
      typeof req.query.workspaceId === "string"
        ? req.query.workspaceId
        : undefined;

    const files = await getFiles(userId, workspaceId);

    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch files",
    });
  }
};

export const getFileByIdController = async (req: Request,res: Response) => {

  try {
    const userId = req.user!.id;
    const id = getParamString(req, "id");

    const file = await getFileById(id, userId);

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch file",
    });
  }
};

export const deleteFileController = async (req: Request,res: Response) => {

  try {
    const userId = req.user!.id;
    const id = getParamString(req, "id");

    const file = await deleteFile(id, userId);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: file,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete file",
    });
  }
};