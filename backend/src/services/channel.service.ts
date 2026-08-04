import prisma from "../config/prisma.js";
import type { CreateChannelInput, UpdateChannelInput } from "../validations/channel.schema.js";

export const createChannel = async (workspaceId: string,data: CreateChannelInput,userId: string) => {

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const existingChannel = await prisma.channel.findFirst({
    where: {
      workspaceId,
      name: data.name,
    },
  });

  if (existingChannel) {
    throw new Error("Channel already exists in this workspace");
  }

 const channel = await prisma.channel.create({
  data: {
    name: data.name,
    description: data.description,
    workspaceId,
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

    workspace: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

return channel;

  return channel;
};

export const getChannels = async (workspaceId: string,userId: string) => {

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const channels = await prisma.channel.findMany({
    where: {
      workspaceId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
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

  return channels;
};

export const getChannelById = async (channelId: string,userId: string) => {
    
  const channel = await prisma.channel.findUnique({
    where: {
      id: channelId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
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

  return channel;
};


export const updateComment = async (channelId: string, data: UpdateChannelInput, userId: string) => {

    const channel = await prisma.channel.findUnique({
        where: {
            id: channelId,
        },
        include: {

            channel: {
                select: {
                    workspaceId: true,
                },
            },
        },
    });
    if (!channel) {
        throw new Error("channel not found");
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


    const updatedChannel = await prisma.comment.update({

        where: {
            id: channelId,
        },

        data: {

            name: data.name,
            description: data.description,
        },

        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },

            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        }
    });

    return updatedChannel;

}

export const deleteComment = async (channelId: string, userId: string) => {

    const channel = await prisma.comment.findUnique({
        where: {
            id: channelId,
        },
        include: {
            channel: {
                select: {
                    workspaceId: true,
                },
            },
        },
    });

    if (!channel) {
        throw new Error("channel not found");
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

    const deletedChannel = await prisma.channel.delete({

        where: {
            id: channelId,
        },

        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },

            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        }
    });

    return deletedChannel;
};