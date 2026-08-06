import type { Request, Response } from "express";
import {createDocumentSchema,updateDocumentSchema,} from "../validations/document.schema.js";
import {createDocument,getDocuments,getDocumentById,updateDocument,deleteDocument,} from "../services/document.services.js";

export const createDocumentController = async (req: Request,res: Response) => {
  try {
    const data = createDocumentSchema.parse(req.body);

    const document = await createDocument(
      req.params.workspaceId,
      data,
      req.user!.id
    );

    return res.status(201).json({
      success: true,
      message: "Document created successfully!",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const getDocumentsController = async (req: Request,res: Response) => {

  try {
    const documents = await getDocuments(
      req.params.workspaceId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully!",
      data: documents,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const getDocumentByIdController = async (req: Request,res: Response) => {

  try {
    const document = await getDocumentById(
      req.params.documentId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Document fetched successfully!",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const updateDocumentController = async (req: Request,res: Response) => {

  try {
    const data = updateDocumentSchema.parse(req.body);

    const document = await updateDocument(
      req.params.documentId,
      data,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Document updated successfully!",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const deleteDocumentController = async (req: Request,res: Response) => {
    
  try {
    const document = await deleteDocument(
      req.params.documentId,
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully!",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};