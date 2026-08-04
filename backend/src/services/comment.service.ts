import prisma from "../config/prisma.js";
import type { CreateCommentInput } from "../validations/comment.schema.js";

export const createComment = async (taskId: string,data: CreateCommentInput,userId: string) => {
    
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

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      taskId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return comment;
};