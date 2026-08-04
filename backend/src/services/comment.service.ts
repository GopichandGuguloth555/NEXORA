import prisma from "../config/prisma.js";
import type { CreateCommentInput, UpdateCommentInput } from "../validations/comment.schema.js";

export const createComment = async (taskId: string, data: CreateCommentInput, userId: string) => {

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

export const getComments = async (taskId: string, userId: string) => {

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

    const comments = await prisma.comment.findMany({

        where: {
            taskId,
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
        orderBy: {
            createdAt: "asc",
        },
    });

    return comments;
};

export const updateComment = async (commentId: string, data: UpdateCommentInput, userId: string) => {

    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            task: {
                select: {
                    project: {
                        select: {
                            workspaceId: true,
                        },
                    },
                },
            },
        },
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: comment.task.project.workspaceId,
                userId,
            },
        },
    });

    if (!member) {
        throw new Error("You are not a member of this workspace");
    }


    const updatedComment = await prisma.comment.update({

        where: {
            id: commentId,
        },

        data: {

            content: data.content,
        },

        include: {
            task: {
                select: {
                    id: true,
                    title: true,
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

    return updatedComment;

}