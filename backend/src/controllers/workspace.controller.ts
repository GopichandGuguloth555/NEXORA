import type { Request, Response } from "express";
import { createWorkspaceSchema } from "../validations/workspace.schema.js";
import { createWorkspace } from "../services/workspace.service.js";

export const create = async (req: Request,res: Response) => {

  try {
    const data = createWorkspaceSchema.parse(req.body);

    const workspace = await createWorkspace(data,req.user!.id);

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });

  } 
  catch (error) 
  {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};