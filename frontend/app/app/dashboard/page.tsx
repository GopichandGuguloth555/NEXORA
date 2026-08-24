"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Project, Task, WorkspaceMember } from "@/lib/types";
import {
  FolderGit2,
  CheckSquare,
  Users,
  MessageSquare,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    total: 0,
  });

  const loadDashboardData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const projRes = await projectService.getProjects(currentWorkspace.id);
      const projData = projRes.data || [];
      setProjects(projData);

      const memRes = await workspaceService.getMembers(currentWorkspace.id);
      setMembers(memRes.data || []);

      let allTasks: Task[] = [];
      for (const p of projData) {
        try {
          const taskRes = await taskService.getTasks(p.id);
          if (taskRes.data) {
            allTasks = [...allTasks, ...taskRes.data];
          }
        } catch {
          // ignore individual project task errors
        }
      }

      setRecentTasks(allTasks.slice(0, 5));
      const todo = allTasks.filter((t) => t.status === "TODO").length;
      const inProgress = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
      const done = allTasks.filter((t) => t.status === "DONE").length;

      setTaskStats({
        todo,
        inProgress,
        done,
        total: allTasks.length,
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-500 anim-fade-up">
        Please select or create a workspace to view the dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden border border-zinc-700/50 anim-scale-in bg-gradient-to-br from-[#1a1a1a] via-[#0c0c0c] to-black shadow-2xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-zinc-400/10 rounded-full blur-3xl pointer-events-none anim-float" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-metallic">
              Welcome back, {user?.name || "Member"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Workspace:{" "}
              <span className="text-zinc-300 font-semibold">{currentWorkspace.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/ai"
              className="nx-btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <span>Plan a project with AI →</span>
            </Link>
            <Link
              href="/app/projects"
              className="nx-btn-ghost px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Projects",
            value: loading ? "..." : projects.length,
            icon: FolderGit2,
            color: "text-zinc-200",
            delay: "stagger-1",
          },
          {
            label: "In Progress Tasks",
            value: loading ? "..." : taskStats.inProgress,
            icon: Clock,
            color: "text-zinc-300",
            delay: "stagger-2",
          },
          {
            label: "Completed Tasks",
            value: loading ? "..." : `${taskStats.done} / ${taskStats.total}`,
            icon: CheckCircle2,
            color: "text-zinc-200",
            delay: "stagger-3",
          },
          {
            label: "Team Members",
            value: loading ? "..." : members.length,
            icon: Users,
            color: "text-zinc-300",
            delay: "stagger-4",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`nx-stat anim-scale-in ${stat.delay} p-5 flex items-center gap-4 cursor-default`}
            >
              <div className="nx-stat-icon relative z-10 p-3 rounded-xl bg-zinc-200/10 text-zinc-300 border border-zinc-500/25">
                <Icon className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold font-display mt-0.5 ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between anim-fade-up stagger-2">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-display">
              <FolderGit2 className="w-5 h-5 text-zinc-400" />
              <span>Workspace Projects</span>
            </h2>
            <Link
              href="/app/projects"
              className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center nx-card anim-fade-up">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
              <div className="text-xs text-zinc-500">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center nx-card space-y-3 anim-scale-in">
              <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto anim-float" />
              <div className="text-sm font-semibold text-zinc-300">No projects yet</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Get started by creating your first project in this workspace.
              </p>
              <Link
                href="/app/projects"
                className="nx-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/app/projects?id=${p.id}`}
                  style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                  className="nx-card nx-card-lg anim-scale-in p-5 space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                        {p.emoji || "🚀"}
                      </span>
                      <span className="font-bold text-zinc-100 group-hover:text-metallic transition-all font-display">
                        {p.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>
                  <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-600 flex items-center justify-between">
                    <span>Created by {p.createdBy?.name || "Team member"}</span>
                    <span className="text-zinc-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          <div className="nx-card p-5 space-y-4 anim-scale-in stagger-3">
            <h3 className="text-sm font-bold text-zinc-100 font-display">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { href: "/app/tasks", icon: CheckSquare, label: "Task Board" },
                { href: "/app/chat", icon: MessageSquare, label: "Chat Channels" },
                { href: "/app/documents", icon: FileText, label: "Documents" },
                { href: "/app/members", icon: Users, label: "Members" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="p-3 rounded-xl bg-black/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500/50 flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                  >
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="nx-card p-5 space-y-4 anim-scale-in stagger-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 font-display">Recent Tasks</h3>
              <Link href="/app/tasks" className="text-xs text-zinc-500 hover:text-zinc-200">
                View all
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-xs text-zinc-600 py-4 text-center">No recent tasks</div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((t, i) => (
                  <div
                    key={t.id}
                    style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                    className="anim-fade-up p-3 rounded-xl bg-black/50 border border-zinc-800 text-xs flex items-center justify-between gap-2 hover:border-zinc-600 hover:translate-x-1 transition-all duration-300"
                  >
                    <span className="font-medium text-zinc-200 truncate">{t.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 border ${
                        t.status === "DONE"
                          ? "bg-zinc-200/10 text-zinc-200 border-zinc-500/30"
                          : t.status === "IN_PROGRESS"
                            ? "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
