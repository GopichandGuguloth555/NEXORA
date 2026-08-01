import prisma from "../config/prisma.js";
import { update } from "../controllers/workspace.controller.js";
import type { CreateProjectInput, UpdateProjectInput } from "../validations/project.schema.js";

export const createProject = async (workspaceId: string, data: CreateProjectInput, userId: string) => {

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

    // Create project
    const createdProject = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            emoji: data.emoji,
            workspaceId,
            createdById: userId,
        },
    });

    return createdProject;
};

export const getProjects = async (workspaceId: string, userId: string) => {

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

    const projects = await prisma.project.findMany({
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
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return projects;
};

export const getProjectById = async (projectId: string, userId: string) => {

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId,
            },
        },
    });

    if (!member) {
        throw new Error("You are not a member of this workspace");
    }

    return project;
};

export const updateProject = async (projectId: string,data: UpdateProjectInput,userId: string) => {

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project does not exist!");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: data.name,
      description: data.description,
      emoji: data.emoji,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedProject;
};

export const deleteProject = async (projectId: string,userId: string) => {
    
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project does not exist!");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const deletedProject = await prisma.project.delete({
    where: {
      id: projectId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return deletedProject;
};


