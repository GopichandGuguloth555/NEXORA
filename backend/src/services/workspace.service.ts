import prisma from "../config/prisma.js";
import type { InviteInput } from "../validations/workspace.schema.js";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validations/workspace.schema.js";

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

export const getWorkspaces = async (userId: string) => {

  const workspaces = await prisma.workspace.findMany({

    where: {
      members: {
        some: {
          userId: userId,
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
    },
  });

  return workspaces;
};

export const updateWorkspace = async (
  workspaceId: string,
  data: UpdateWorkspaceInput,
  userId: string
) => {
  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check membership
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

  // Check role
  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // Update workspace
  const updatedWorkspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },

    data: {
      name: data.name,
      description: data.description,
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
    },
  });

  return updatedWorkspace;
};

export const deleteWorkspace = async (
  workspaceId: string,
  userId: string
) => {

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

  if (member.role !== "OWNER") {
    throw new Error("Forbidden");
  }

  return await prisma.$transaction(async (tx) => {

    await tx.workspaceMember.deleteMany({
      where: {
        workspaceId,
      },
    });

    const deletedWorkspace = await tx.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return deletedWorkspace;
  });
};
export const inviteMember = async (
  workspaceId: string,
  data: InviteInput,
  userId: string
) => {


  const allWorkspaces = await prisma.workspace.findMany();

  console.log(
    "All workspaces:",
    allWorkspaces.map((w) => ({
      id: w.id,
      name: w.name,
      ownerId: w.ownerId,
    }))
  );

  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  console.log("Workspace Found:", workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check requester permissions
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  console.log("Member:", member);

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // Find invited user
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });


  if (!user) {
    throw new Error("User does not exist");
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });


  if (existingMember) {
    throw new Error("User is already a member");
  }

  // Add member
  const createdMember = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: user.id,
      role: data.role,
    },
  });


  return createdMember;
};

export const getWorkspaceMembers = async (workspaceId: string,userId: string) => 
  {

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

 
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new Error("You are not a member of this workspace");
  }


  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return members;
};