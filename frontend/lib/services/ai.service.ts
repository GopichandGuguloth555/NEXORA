import { api } from "../api";
import { ApiResponse, AIProjectPlan } from "../types";

export const aiService = {
  async generatePlan(prompt: string, workspaceId?: string): Promise<ApiResponse<AIProjectPlan>> {
    const res = await api.post<ApiResponse<AIProjectPlan>>("/ai/plan", { prompt, workspaceId });
    return res.data;
  },

  async askAssistant(prompt: string, context?: string): Promise<ApiResponse<{ reply: string }>> {
    const res = await api.post<ApiResponse<{ reply: string }>>("/ai/assistant", { prompt, context });
    return res.data;
  },
};
