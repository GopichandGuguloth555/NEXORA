"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Workspace } from "../lib/types";
import { workspaceService } from "../lib/services/workspace.service";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await workspaceService.getAllWorkspaces();
      if (res.success && res.data) {
        setWorkspaces(res.data);
        const storedWsId = localStorage.getItem("nexora_current_ws");
        const found = res.data.find((w) => w.id === storedWsId);
        if (found) {
          setCurrentWorkspaceState(found);
        } else if (res.data.length > 0) {
          setCurrentWorkspaceState(res.data[0]);
          localStorage.setItem("nexora_current_ws", res.data[0].id);
        } else {
          setCurrentWorkspaceState(null);
        }
      }
    } catch (error) {
      console.error("Failed to load workspaces", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem("nexora_current_ws", workspace.id);
  };

  const createWorkspace = async (name: string, description?: string) => {
    const res = await workspaceService.createWorkspace({ name, description });
    if (res.success && res.data) {
      await fetchWorkspaces();
      setCurrentWorkspace(res.data);
      return res.data;
    }
    throw new Error(res.message || "Failed to create workspace");
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        setCurrentWorkspace,
        fetchWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
