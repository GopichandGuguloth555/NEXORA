import type { Request, Response } from "express";
import { createTask, deleteTask, getTaskById, updateTask } from "../services/task.service.js";
import { createTaskSchema, updateTaskSchema } from "../validations/task.schema.js";
import { getTasks } from "../services/task.service.js";


export const createTaskController = async ( req: Request, res: Response) => {

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

export const getTasksController = async ( req: Request, res: Response) => {

  try {
    const tasks = await getTasks(
      req.params.projectId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully!",
      data: tasks,
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

export const getTaskByIdController = async (req: Request,res: Response) => {
    
  try {
    const task = await getTaskById(

      req.params.taskId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully!",
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

export const updateTaskController = async (req: Request,res: Response) => {

  try {
    const data = updateTaskSchema.parse(req.body);

    const task = await updateTask(
      req.params.taskId,
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully!",
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

export const deleteTaskController = async (req: Request,res: Response) => {

  try {
    const task = await deleteTask(
        
      req.params.taskId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully!",
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