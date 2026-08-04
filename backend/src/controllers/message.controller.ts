import type { Request, Response } from "express";
import { createMessageSchema, updateMessageSchema, type UpdateMessageInput } from "../validations/message.schema.js";
import { createMessage, deleteMessage, getMessageById, getMessages, updateMessage } from "../services/message.service.js";


export const createMessageController = async (req: Request, res: Response) => {

    try {
        const data = createMessageSchema.parse(req.body);

        const channelId = req.params.channelId;

        const message = await createMessage(
            channelId,
            data,
            req.user!.id
        );

        return res.status(201).json({
            success: true,
            message: " Message created successfully!",
            data: message,
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

export const getMessgesController = async (req: Request, res: Response) => {

    try {
        const channelId = req.params.channelId;

        const messages = await getMessages(
            channelId,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully!",
            data: messages,
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

export const getMessageByIDController = async (req: Request,res: Response) => {
  try {
    const messageId = req.params.messageId;

    const message = await getMessageById(
      messageId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "message fetched successfully!",
      data: message,
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

export const updateMessageController = async (req: Request, res: Response) => {

    try {

        const data = updateMessageSchema.parse(req.body);

        const message = await updateMessage(
            req.params.messageId,
            data,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: " Message updated successfully!",
            data: message,
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

export const deleteMessageController = async (req: Request,res: Response) => {
    
  try {
    const message = await deleteMessage(
      req.params.messageId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully!",
      data: message,
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