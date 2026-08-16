"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  clearSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  onUnauthorized,
  subscribeSession,
  writeSession,
} from "@/lib/session";
import {
  authService,
  type LoginInput,
  type RegisterInput,
} from "@/services/auth.service";
import type { User } from "@/types/models";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "anonymous";
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // The stored session only exists in the browser, so the server render and the
  // hydration pass both report "loading" until the client takes over.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  useEffect(() => {
    onUnauthorized(() => router.replace("/login"));
    return () => onUnauthorized(null);
  }, [router]);

  const login = useCallback(async (input: LoginInput) => {
    writeSession(await authService.login(input));
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      // Register does not return a token, so sign in right after creating the user.
      await authService.register(input);
      await login({ email: input.email, password: input.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      status: !hydrated ? "loading" : session ? "authenticated" : "anonymous",
      login,
      register,
      logout,
    }),
    [hydrated, session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
