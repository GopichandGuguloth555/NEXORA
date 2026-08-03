import type { Request, Response } from "express";
import { createTask } from "../services/task.service.js";
import { createTaskSchema } from "../validations/task.schema.js";

export const createTaskController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const projectId = req.params.projectId;

    const task = await createTask(
      projectId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully!",
      data: task,
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