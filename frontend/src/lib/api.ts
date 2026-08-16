import axios from "axios";
import { API_BASE_URL } from "@/lib/env";
import { notifyUnauthorized, readToken } from "@/lib/session";
import { ApiError, type ApiResponse } from "@/types/api";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface ZodIssue {
  message?: string;
  path?: (string | number)[];
}

/**
 * The backend returns validation failures as `error.message`, which for Zod is a
 * serialised array of issues. Turn whatever arrives into one readable sentence.
 */
function readableMessage(raw: unknown, fallback: string): string {
  if (typeof raw !== "string" || raw.trim() === "") return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return trimmed;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    const issues = Array.isArray(parsed) ? (parsed as ZodIssue[]) : [];
    const messages = issues
      .map((issue) => issue.message)
      .filter((message): message is string => Boolean(message));
    return messages.length > 0 ? messages.join(". ") : fallback;
  } catch {
    return trimmed;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw new ApiError("Unexpected error. Please try again.", 0);
    }

    if (!error.response) {
      throw new ApiError(
        "Cannot reach the Nexora server. Check that the backend is running.",
        0,
      );
    }

    const status = error.response.status;
    const body = error.response.data as ApiResponse<unknown> | undefined;

    if (status === 401) {
      notifyUnauthorized();
    }

    throw new ApiError(
      readableMessage(body?.message, "Something went wrong. Please try again."),
      status,
    );
  },
);

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  const body = response.data;
  if (!body.success || body.data === undefined) {
    throw new ApiError(body.message ?? "Request failed", 200);
  }
  return body.data;
}
