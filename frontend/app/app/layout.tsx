"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";
import { Loader2, Plus, Layers } from "lucide-react";

export default function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { workspaces, currentWorkspace, loading: wsLoading, createWorkspace } = useWorkspace();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [initializingWorkspace, setInitializingWorkspace] = useState(false);

  // Protect routes: Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [token, authLoading, router]);

  // Auto create default workspace if user has none
  useEffect(() => {
    const handleInitialWorkspace = async () => {
      if (!authLoading && token && !wsLoading && workspaces.length === 0 && !initializingWorkspace) {
        try {
          setInitializingWorkspace(true);
          const name = user?.name ? `${user.name}'s Workspace` : "My Workspace";
          await createWorkspace(name, "Default workspace created automatically");
        } catch (err) {
          console.error("Auto workspace creation error", err);
        } finally {
          setInitializingWorkspace(false);
        }
      }
    };
    handleInitialWorkspace();
  }, [authLoading, token, wsLoading, workspaces.length, user]);

  if (authLoading || wsLoading || initializingWorkspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <div className="text-sm font-medium text-slate-400">Loading Nexora Workspace...</div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onCreateWorkspaceOpen={() => setCreateWsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader onMobileMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {workspaces.length === 0 ? (
            <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Welcome to Nexora!</h2>
              <p className="text-sm text-slate-400">
                You don't have any active workspace yet. Create one to get started with your projects.
              </p>
              <button
                onClick={() => setCreateWsOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workspace</span>
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Modal */}
      <CreateWorkspaceModal isOpen={createWsOpen} onClose={() => setCreateWsOpen(false)} />
    </div>
  );
}
