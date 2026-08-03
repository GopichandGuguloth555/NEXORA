import prisma from "../config/prisma.js";
import type { CreateTaskInput } from "../validations/task.schema.js";

export const createTask = async (projectId: string, data: CreateTaskInput, userId: string) => {

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
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

    if (data.assigneeId) {
        const assignee = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId: data.assigneeId,
                },
            },
        });

        if (!assignee) {
            throw new Error("Assignee is not a member of this workspace");
        }
    }

    const createdTask = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            projectId,
            assigneeId: data.assigneeId,
            createdById: userId,
        },

        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
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

    return createdTask;

};

export const getTasks = async (projectId: string,userId: string) => {

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
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

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return tasks;
};

export const getTaskById = async ( taskId: string,userId: string) => {

 const task = await prisma.task.findUnique({
  where: {
    id: taskId,
  },

  include: {
    project: {
      select: {
        workspaceId: true,
      },
    },

    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },

    assignee: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});

  if (!task) {
    throw new Error("Task not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  return task;
};