"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Layers,
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  MessageSquare,
  FileText,
  FolderDown,
  Bell,
  Sparkles,
  Users,
  ChevronDown,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onCreateWorkspaceOpen: () => void;
}

export function AppSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onCreateWorkspaceOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/app/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/app/projects", icon: FolderGit2 },
    { label: "Tasks", href: "/app/tasks", icon: CheckSquare },
    { label: "Channels", href: "/app/chat", icon: MessageSquare },
    { label: "Documents", href: "/app/documents", icon: FileText },
    { label: "Files", href: "/app/files", icon: FolderDown },
    { label: "Notifications", href: "/app/notifications", icon: Bell },
    { label: "Members & Roles", href: "/app/members", icon: Users },
    { label: "AI Planner", href: "/app/ai", icon: Sparkles, badge: "AI" },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-[fade-up_0.3s_ease]"
        />
      )}

      <aside
        className={`nx-sidebar fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-400 ease-out bg-gradient-to-b from-[#121212] to-[#0a0a0a] shadow-[4px_0_24px_rgba(0,0,0,0.4)] border-r border-white/5 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(200,200,200,0.06),_transparent_55%)]" />

        {/* Brand */}
        <div className="relative p-4 border-b border-zinc-800/70 flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="p-2 rounded-xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-200 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
              <Layers className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-display font-extrabold text-lg tracking-tight truncate text-metallic">
                Nexora
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-300 hover:scale-110"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace switcher */}
        <div className="relative p-3 border-b border-zinc-800/50">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-black/50 hover:bg-black border border-zinc-800 hover:border-zinc-600 text-left transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-metallic text-black font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                {currentWorkspace?.name
                  ? currentWorkspace.name.substring(0, 2).toUpperCase()
                  : "NX"}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-zinc-100 truncate">
                    {currentWorkspace?.name || "Select Workspace"}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
          </button>

          {dropdownOpen && !collapsed && (
            <div className="absolute left-3 right-3 top-16 z-50 p-2 bg-[#0e0e0e] border border-zinc-700/80 rounded-xl shadow-2xl space-y-1 anim-scale-in">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1">
                Your Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                    ws.id === currentWorkspace?.id
                      ? "bg-zinc-200/15 text-zinc-100 font-semibold border border-zinc-500/30"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  )}
                </button>
              ))}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onCreateWorkspaceOpen();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800/80 font-semibold flex items-center gap-1.5 mt-1 border-t border-zinc-800 pt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                className={`nx-nav-item anim-slide-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "active"
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                    isActive ? "text-zinc-200" : "group-hover:scale-110"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200/15 text-zinc-300 border border-zinc-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="relative p-3 border-t border-zinc-800/70">
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-800/60 hover:border-zinc-600 transition-all duration-300">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-zinc-100 truncate">{user?.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 hover:scale-110"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
