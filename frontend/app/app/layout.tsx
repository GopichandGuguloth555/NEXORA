"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Plus, Layers } from "lucide-react";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { token, loading: authLoading } = useAuth();

  const { workspaces, loading: wsLoading } = useWorkspace();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [token, authLoading, router]);

  if (authLoading || wsLoading) {
    return (
      <LoadingScreen
        message={
          authLoading
            ? "Signing you in..."
            : "Loading workspace..."
        }
      />
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row text-zinc-100">
      <AppSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onCreateWorkspaceOpen={() => setCreateWsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {workspaces.length === 0 ? (
            <div className="max-w-md mx-auto my-20 nx-card nx-card-lg p-8 text-center space-y-4 anim-scale-in">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-300 mx-auto flex items-center justify-center anim-float">
                <Layers className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-zinc-100 font-display">
                Welcome to Nexora!
              </h2>

              <p className="text-sm text-zinc-500">
                You don&apos;t have any active workspace yet. Create one to
                get started with your projects.
              </p>

              <button
                onClick={() => setCreateWsOpen(true)}
                className="nx-btn-primary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
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

      <CreateWorkspaceModal
        isOpen={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
      />
    </div>
  );
}