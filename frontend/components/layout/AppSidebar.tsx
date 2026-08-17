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
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header / Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-white tracking-tight truncate">
                Nexora
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 relative border-b border-slate-800/60">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-left transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentWorkspace?.name ? currentWorkspace.name.substring(0, 2).toUpperCase() : "NX"}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentWorkspace?.name || "Select Workspace"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && !collapsed && (
            <div className="absolute left-3 right-3 top-16 z-50 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Your Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                    ws.id === currentWorkspace?.id
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onCreateWorkspaceOpen();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-indigo-400 hover:bg-indigo-600/10 font-semibold flex items-center gap-1.5 mt-1 border-t border-slate-800/80 pt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
