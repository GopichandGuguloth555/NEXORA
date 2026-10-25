"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../lib/types";
import { authService } from "../lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedToken = localStorage.getItem("nexora_token");
        const storedUser = localStorage.getItem("nexora_user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to restore auth state", err);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken } = res.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem("nexora_token", accessToken);
      localStorage.setItem("nexora_user", JSON.stringify(userData));
    } else {
      throw new Error(res.message || "Login failed");
    }
  };

  const googleLogin = async (idToken: string) => {
    const res = await authService.googleLogin(idToken);
    if (res.success && res.data) {
      const { user: userData, accessToken } = res.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem("nexora_token", accessToken);
      localStorage.setItem("nexora_user", JSON.stringify(userData));
    } else {
      throw new Error(res.message || "Google login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    if (res.success) {
      // Auto login after registration
      await login(email, password);
    } else {
      throw new Error(res.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("nexora_user");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
