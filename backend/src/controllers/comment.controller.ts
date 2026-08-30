import { getParamString } from "../utils/params.js";
import type { Request, Response } from "express";
import { createComment, deleteComment, getCommentById, updateComment,  } from "../services/comment.service.js";
import { createCommentSchema, updateCommentSchema } from "../validations/comment.schema.js";
import { getComments } from "../services/comment.service.js";

export const createCommentController = async (req: Request, res: Response) => {

    try {
        const data = createCommentSchema.parse(req.body);

        const taskId = getParamString(req, "taskId");

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

export const getCommentsController = async (req: Request, res: Response) => {

    try {
        const taskId = getParamString(req, "taskId");

        const comments = await getComments(
            taskId,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully!",
            data: comments,
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

export const getCommentByIDController = async (req: Request,res: Response) => {
  try {
    const commentId = getParamString(req, "commentId");

    const comment = await getCommentById(
      commentId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Comment fetched successfully!",
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

export const updateCommentController = async (req: Request, res: Response) => {

    try {

        const data = updateCommentSchema.parse(req.body);

        const comment = await updateComment(
            getParamString(req, "commentId"),
            data,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: "comment updated successfully!",
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

export const deleteCommentController = async (req: Request,res: Response) => {

  try {

    const comment = await deleteComment(
        
      getParamString(req, "commentId"),
      req.user!.id
    );

    return res.status(200).json({
            success: true,
            message: "Comment deleted successfully!",
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