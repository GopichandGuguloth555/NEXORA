import { api } from "../api";
import { ApiResponse, DocumentItem } from "../types";

export const documentService = {
  async getDocuments(workspaceId: string): Promise<ApiResponse<DocumentItem[]>> {
    const res = await api.get<ApiResponse<DocumentItem[]>>(`/documents/workspaces/${workspaceId}`);
    return res.data;
  },

  async createDocument(workspaceId: string, data: { title: string; content: string }): Promise<ApiResponse<DocumentItem>> {
    const res = await api.post<ApiResponse<DocumentItem>>(`/documents/workspaces/${workspaceId}`, data);
    return res.data;
  },

  async getDocumentById(documentId: string): Promise<ApiResponse<DocumentItem>> {
    const res = await api.get<ApiResponse<DocumentItem>>(`/documents/${documentId}`);
    return res.data;
  },

  async updateDocument(documentId: string, data: { title?: string; content?: string }): Promise<ApiResponse<DocumentItem>> {
    const res = await api.put<ApiResponse<DocumentItem>>(`/documents/${documentId}`, data);
    return res.data;
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<DocumentItem>> {
    const res = await api.delete<ApiResponse<DocumentItem>>(`/documents/${documentId}`);
    return res.data;
  },
};
