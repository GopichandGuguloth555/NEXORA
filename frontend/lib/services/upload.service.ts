import { api } from "../api";
import { ApiResponse, FileItem } from "../types";

export const uploadService = {
  async uploadFile(file: File, workspaceId?: string): Promise<ApiResponse<FileItem>> {
    const formData = new FormData();
    formData.append("file", file);
    if (workspaceId) {
      formData.append("workspaceId", workspaceId);
    }

    const res = await api.post<ApiResponse<FileItem>>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async getFiles(workspaceId?: string): Promise<ApiResponse<FileItem[]>> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : "";
    const res = await api.get<ApiResponse<FileItem[]>>(`/uploads${query}`);
    return res.data;
  },

  async getFileById(id: string): Promise<ApiResponse<FileItem>> {
    const res = await api.get<ApiResponse<FileItem>>(`/uploads/${id}`);
    return res.data;
  },

  async deleteFile(id: string): Promise<ApiResponse<FileItem>> {
    const res = await api.delete<ApiResponse<FileItem>>(`/uploads/${id}`);
    return res.data;
  },
};
