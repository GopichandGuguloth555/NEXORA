import type { Request, Response } from "express";
import { createWorkspaceSchema, updateWorkspaceSchema} from "../validations/workspace.schema.js";
import { createWorkspace } from "../services/workspace.service.js";
import { getWorkspaces, updateWorkspace } from "../services/workspace.service.js";

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

export const getAllWorkspaces = async (
  req: Request,
  res: Response
) => {
  try {
    const workspaces = await getWorkspaces(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
      data: workspaces,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const update = async (
  req: Request,
  res: Response
) => {
  try {
    const data = updateWorkspaceSchema.parse(req.body);

    const workspace = await updateWorkspace(
      req.params.workspaceId,
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};