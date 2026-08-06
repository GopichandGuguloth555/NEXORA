import { channel } from "node:diagnostics_channel";
import prisma from "../config/prisma.js";
import type { CreateMessageInput, UpdateMessageInput } from "../validations/message.schema.js";
import { getIO } from "../sockets/socket.js";

export const createMessage = async (channelId: string, data: CreateMessageInput, userId: string) => {

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

  const io = getIO();

  io.to(channelId).emit("new-message", message);

  return message;
};

export const getMessages = async (channelId: string, userId: string) => {

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

  const messages = await prisma.message.findMany({
    where: {
      channelId,
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

    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};

export const getMessageById = async (messageId: string, userId: string) => {

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
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
          workspaceId: true,
        },
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: message.channel.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  return message;
};

export const updateMessage = async (messageId: string, data: UpdateMessageInput, userId: string) => {

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      channel: {
        select: {
          workspaceId: true,
        },
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: message.channel.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const updatedMessage = await prisma.message.update({
    where: {
      id: messageId,
    },

    data: {
      content: data.content,
    },

    include: {
      channel: {
        select: {
          id: true,
          name: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const io = getIO();

  io.to(updatedMessage.channel.id).emit(
    "message-updated",
    updatedMessage
  );

  return updatedMessage;
};

export const deleteMessage = async (messageId: string, userId: string) => {

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      channel: {
        select: {
          workspaceId: true,
        },
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: message.channel.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const deletedMessage = await prisma.message.delete({
    where: {
      id: messageId,
    },

    include: {
      channel: {
        select: {
          id: true,
          name: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const io = getIO();

  io.to(deletedMessage.channel.id).emit(
    "message-deleted",
    {
      id: deletedMessage.id,
    }
  );

  return deletedMessage;
};