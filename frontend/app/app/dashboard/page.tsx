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
  AlertCircle,
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
      // Fetch projects
      const projRes = await projectService.getProjects(currentWorkspace.id);
      const projData = projRes.data || [];
      setProjects(projData);

      // Fetch members
      const memRes = await workspaceService.getMembers(currentWorkspace.id);
      setMembers(memRes.data || []);

      // Fetch tasks across projects
      let allTasks: Task[] = [];
      for (const p of projData) {
        try {
          const taskRes = await taskService.getTasks(p.id);
          if (taskRes.data) {
            allTasks = [...allTasks, ...taskRes.data];
          }
        } catch (err) {
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
      <div className="p-8 text-center text-slate-400">
        Please select or create a workspace to view the dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Member"} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Workspace: <span className="text-indigo-300 font-semibold">{currentWorkspace.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/ai"
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Plan a project with AI →</span>
            </Link>
            <Link
              href="/app/projects"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Projects</div>
            <div className="text-2xl font-bold text-white mt-0.5">{loading ? "..." : projects.length}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">In Progress Tasks</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{loading ? "..." : taskStats.inProgress}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Completed Tasks</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{loading ? "..." : `${taskStats.done} / ${taskStats.total}`}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Team Members</div>
            <div className="text-2xl font-bold text-violet-300 mt-0.5">{loading ? "..." : members.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
              <span>Workspace Projects</span>
            </h2>
            <Link href="/app/projects" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
              <div className="text-xs text-slate-400">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <FolderGit2 className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No projects yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Get started by creating your first project in this workspace.
              </p>
              <Link
                href="/app/projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/projects?id=${p.id}`}
                  className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.emoji || "🚀"}</span>
                      <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Created by {p.createdBy?.name || "Team member"}</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Upcoming Tasks */}
        <div className="space-y-6">
          {/* Quick Access Nav */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/app/tasks"
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Task Board</span>
              </Link>
              <Link
                href="/app/chat"
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Chat Channels</span>
              </Link>
              <Link
                href="/app/documents"
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Documents</span>
              </Link>
              <Link
                href="/app/members"
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4 text-violet-400" />
                <span>Members</span>
              </Link>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Tasks</h3>
              <Link href="/app/tasks" className="text-xs text-indigo-400 hover:underline">
                View all
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No recent tasks</div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-medium text-slate-200 truncate">{t.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                        t.status === "DONE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : t.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400"
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
