import type { Request, Response } from "express";
import { createProject } from "../services/project.services.js";
import { createProjectSchema } from "../validations/project.schema.js";
import { getProjects } from "../services/project.services.js";
import { getProjectById } from "../services/project.services.js";
import { updateProject } from "../services/project.services.js";
import { updateProjectSchema } from "../validations/project.schema.js";
import { deleteProject } from "../services/project.services.js";


export const createProjectController = async (req: Request,res: Response) => {

  try 
  {
    const data = createProjectSchema.parse(req.body);

    const workspaceId = req.params.workspaceId;

    const project = await createProject(
      workspaceId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully!",
      data: project,
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

export const getProjectsController = async (req: Request,res: Response) => {

  try 
  {
    const workspaceId = req.params.workspaceId;

    const projects = await getProjects(
      workspaceId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully!",
      data: projects,
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

export const getProjectByIdController = async (req: Request,res: Response) => {

  try {
    const projectId = req.params.projectId;

    const project = await getProjectById(
      projectId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully!",
      data: project,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Project not found")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes("not a member") || error.message.includes("Forbidden")) {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

export const updateProjectController = async (req: Request,res: Response) => {

  try {
    const data = updateProjectSchema.parse(req.body);

    const projectId = req.params.projectId;

    const project = await updateProject(
      projectId,
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully!",
      data: project,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Project does not exist")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes("not a member") || error.message.includes("Forbidden")) {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

export const deleteProjectController = async (req: Request,res: Response) => {

  try {
    const projectId = req.params.projectId;

    const project = await deleteProject(
      projectId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully!",
      data: project,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Project does not exist")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes("not a member") || error.message.includes("Forbidden")) {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: "Something went wrong" });
  }
};