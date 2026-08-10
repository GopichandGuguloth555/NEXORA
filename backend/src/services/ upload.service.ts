import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

export const uploadFile = async ( file: Express.Multer.File,userId: string,workspaceId?: string) => {

  const result: UploadApiResponse = await new Promise(
    (resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "nexora",
          resource_type: "auto",
        },

        (error, result) => {

          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error("Upload failed"));
          }

          resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(stream);
    }
  );

  const savedFile = await prisma.file.create({
    data: {
      name: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: file.mimetype,
      size: file.size,
      uploadedById: userId,
      workspaceId,
    },
  });

  return savedFile;
};

export const getFiles = async (userId: string, workspaceId?: string) => {

  const files = await prisma.file.findMany({
    where: {
      uploadedById: userId,
      ...(workspaceId ? { workspaceId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return files;
};

export const getFileById = async (fileId: string, userId: string) => {

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  if (file.uploadedById !== userId) {
    throw new Error("You are not authorized to access this file");
  }

  return file;
};

export const deleteFile = async (fileId: string,userId: string) => {
  
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  if (file.uploadedById !== userId) {
    throw new Error("You are not authorized to delete this file");
  }

  await cloudinary.uploader.destroy(file.publicId, {
    resource_type: "image",
  });

  const deletedFile = await prisma.file.delete({
    where: {
      id: fileId,
    },
  });

  return deletedFile;
};