import prisma from "../config/prisma.js";
import type { CreateDocumentInput, UpdateDocumentInput } from "../validations/document.schema.js";

export const createDocument = async (workspaceId: string,data: CreateDocumentInput,userId: string) => {

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

  const document = await prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
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

  return document;
};

export const getDocuments = async (workspaceId: string,userId: string) => {

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

  const documents = await prisma.document.findMany({
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
      updatedAt: "desc",
    },
  });

  return documents;
};

export const getDocumentById = async (documentId: string,userId: string) => {

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
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
          ownerId: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: document.workspace.id,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  return document;
};

export const updateDocument = async (documentId: string,data: UpdateDocumentInput,userId: string) => {

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
    include: {
      workspace: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: document.workspace.id,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const updatedDocument = await prisma.document.update({
    where: {
      id: documentId,
    },

    data: {
      ...data,
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

  return updatedDocument;
};

export const deleteDocument = async (documentId: string,userId: string) => {
    
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
    include: {
      workspace: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: document.workspace.id,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  const deletedDocument = await prisma.document.delete({
    where: {
      id: documentId,
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

  return deletedDocument;
};