import prisma from "../config/prisma.js";
import type { CreateMessageInput } from "../validations/message.schema.js";

export const createMessage = async (channelId: string,data: CreateMessageInput, userId: string) => {
    
  const channel = await prisma.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: channel.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const message = await prisma.message.create({
    data: {
      content: data.content,
      channelId,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return message;
};