import { api, unwrap } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { ApiResponse } from "@/types/api";
import type { AuthSession, User } from "@/types/models";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  /** The backend does not return a token on register, only the created user. */
  async register(input: RegisterInput): Promise<User> {
    return unwrap(
      await api.post<ApiResponse<User>>(endpoints.auth.register, input),
    );
  },

  async login(input: LoginInput): Promise<AuthSession> {
    return unwrap(
      await api.post<ApiResponse<AuthSession>>(endpoints.auth.login, input),
    );
  },
};
