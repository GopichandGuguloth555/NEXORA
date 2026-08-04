import type { Request, Response } from "express";
import { createChannelSchema, updateChannelSchema } from "../validations/channel.schema.js";
import { createChannel, deleteChannel, getChannelById, getChannels, updateChannel } from "../services/channel.service.js";

export const createChannelController = async (req: Request,res: Response) => {
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

export const getChannelsController = async (req: Request, res: Response) => {

  try {
    const workspaceId = req.params.workspaceId;

    const channels = await getChannels(
      workspaceId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Channels fetched successfully!",
      data: channels,
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

export const getChannelByIDController = async (req: Request,res: Response) => {

  try {
    const channelId = req.params.channelId;

    const channel = await getChannelById(
      channelId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "channel fetched successfully!",
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

export const updateChannelController = async (req: Request, res: Response) => {

    try {

        const data = updateChannelSchema.parse(req.body);

        const channel = await updateChannel(
            req.params.channelId,
            data,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: "channel updated successfully!",
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

export const deleteChannelController = async (req: Request,res: Response) => {

  try {
    const channel = await deleteChannel(
      req.params.channelId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Channel deleted successfully!",
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