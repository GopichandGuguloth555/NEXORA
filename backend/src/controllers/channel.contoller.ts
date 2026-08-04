import type { Request, Response } from "express";
import { createChannelSchema } from "../validations/channel.schema.js";
import { createChannel } from "../services/channel.service.js";

export const createChannelController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createChannelSchema.parse(req.body);

    const workspaceId = req.params.workspaceId;

    const channel = await createChannel(
      workspaceId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Channel created successfully!",
      data: channel,
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