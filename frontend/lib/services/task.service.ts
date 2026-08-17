import { api } from "../api";
import { ApiResponse, Comment, Task, TaskPriority, TaskStatus } from "../types";

export const taskService = {
  async getTasks(projectId: string): Promise<ApiResponse<Task[]>> {
    const res = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`);
    return res.data;
  },

  async createTask(
    projectId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      assigneeId?: string;
    }
  ): Promise<ApiResponse<Task>> {
    const res = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return res.data;
  },

  async getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return res.data;
  },

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      assigneeId?: string | null;
    }
  ): Promise<ApiResponse<Task>> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return res.data;
  },

  async deleteTask(taskId: string): Promise<ApiResponse<Task>> {
    const res = await api.delete<ApiResponse<Task>>(`/tasks/${taskId}`);
    return res.data;
  },

  async getComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    const res = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
    return res.data;
  },

  async createComment(taskId: string, content: string): Promise<ApiResponse<Comment>> {
    const res = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content });
    return res.data;
  },

  async deleteComment(taskId: string, commentId: string): Promise<ApiResponse<Comment>> {
    const res = await api.delete<ApiResponse<Comment>>(`/tasks/${taskId}/comments/${commentId}`);
    return res.data;
  },
};
