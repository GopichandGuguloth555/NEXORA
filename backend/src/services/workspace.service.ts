import prisma from "../config/prisma.js";
import type { CreateWorkspaceInput } from "../validations/workspace.schema.js";

export const createWorkspace = async (data: CreateWorkspaceInput, userId: string) => {

  const workspace = await prisma.workspace.create({

    data:
    {
      name: data.name,
      description: data.description,

      owner:
      {
        connect:
        {
          id: userId,
        },
      },

      members: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          role: "OWNER",
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      members: true,
    }
  });

  return workspace;
};