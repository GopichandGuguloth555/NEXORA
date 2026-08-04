import type { Request, Response } from "express";
import { createMessageSchema } from "../validations/message.schema.js";
import { createMessage, getMessageById, getMessages } from "../services/message.service.js";


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
