import { api } from "../api";
import { ApiResponse, AuthResponseData, User } from "../types";

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>("/auth/register", data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/login", data);
    return res.data;
  },
};
