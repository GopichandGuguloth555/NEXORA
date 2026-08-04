import type { Request, Response } from "express";
import { createComment } from "../services/comment.service.js";
import { createCommentSchema } from "../validations/comment.schema.js";

export const createCommentController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createCommentSchema.parse(req.body);

    const taskId = req.params.taskId;

    const comment = await createComment(
      taskId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Comment created successfully!",
      data: comment,
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