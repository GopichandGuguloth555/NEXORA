import axios, { AxiosError } from "axios";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://nexora-bvpv.onrender.com/api");

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "").endsWith("/api")
  ? configuredApiUrl.replace(/\/+$/, "")
  : `${configuredApiUrl.replace(/\/+$/, "")}/api`;

export const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.trim().replace(/\/+$/, "") ||
  API_BASE_URL.replace(/\/api$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nexora_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 & error responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear token on 401 if not already on auth page
        const isAuthPage = window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/register");
        if (!isAuthPage) {
          localStorage.removeItem("nexora_token");
          localStorage.removeItem("nexora_user");
          window.location.href = "/login";
        }
      }
    }
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);
