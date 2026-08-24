"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { Project } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  ArrowRight,
  User as UserIcon,
  Calendar,
  CheckSquare,
} from "lucide-react";

interface ProjectWithCount extends Project {
  taskCount?: number;
}

export default function ProjectsPage() {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createEmoji, setCreateEmoji] = useState("🚀");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editEmoji, setEditEmoji] = useState("🚀");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const emojis = ["🚀", "⚡", "🎯", "🎨", "🛠️", "📊", "💡", "🔥", "💻", "🌐"];

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await projectService.getProjects(currentWorkspace.id);
      const projectList = res.data || [];

      // Fetch task count for each project
      const projectsWithCounts = await Promise.all(
        projectList.map(async (p) => {
          try {
            const taskRes = await taskService.getTasks(p.id);
            return { ...p, taskCount: taskRes.data ? taskRes.data.length : 0 };
          } catch {
            return { ...p, taskCount: 0 };
          }
        })
      );

      setProjects(projectsWithCounts);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentWorkspace]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setCreateError(null);

    if (createName.trim().length < 3) {
      setCreateError("Project name must be at least 3 characters");
      return;
    }

    try {
      setCreating(true);
      const res = await projectService.createProject(currentWorkspace.id, {
        name: createName.trim(),
        description: createDesc.trim() || undefined,
        emoji: createEmoji,
      });

      if (res.success && res.data) {
        showToast("success", `Project "${res.data.name}" created!`);
        setCreateName("");
        setCreateDesc("");
        setIsCreateOpen(false);
        await fetchProjects();
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDesc(project.description || "");
    setEditEmoji(project.emoji || "🚀");
    setEditError(null);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setEditError(null);

    if (editName.trim().length < 3) {
      setEditError("Project name must be at least 3 characters");
      return;
    }

    try {
      setUpdating(true);
      const res = await projectService.updateProject(editingProject.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        emoji: editEmoji,
      });

      if (res.success && res.data) {
        showToast("success", "Project updated successfully!");
        setEditingProject(null);
        await fetchProjects();
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? All associated tasks will be permanently removed.`)) return;

    try {
      await projectService.deleteProject(projectId);
      showToast("success", `Project "${projectName}" deleted`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete project");
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-12 text-center bg-[#121212]/70 rounded-2xl border border-zinc-800 space-y-4 max-w-md mx-auto my-12">
        <FolderGit2 className="w-10 h-10 text-zinc-500 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-100">No Workspace Selected</h2>
        <p className="text-xs text-zinc-400">Please select or create a workspace to manage projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-zinc-400" />
            <span>Workspace Projects</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Projects & initiatives in <span className="text-zinc-300 font-semibold">{currentWorkspace.name}</span>
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="nx-btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-[#121212]/70 border border-zinc-800 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-zinc-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* INTENTIONAL EMPTY STATE */
        <div className="p-12 text-center bg-[#121212]/90 rounded-3xl border border-zinc-800/80 max-w-lg mx-auto my-12 space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-400 mx-auto flex items-center justify-center">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">No projects yet</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Create your first project and start planning your work with tasks, team assignments, and real-time updates.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-black text-sm font-medium rounded-xl shadow-lg shadow-zinc-400/20 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        /* PROJECTS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="nx-card nx-card-lg anim-scale-in p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/app/projects/${p.id}`} className="flex items-center gap-3 overflow-hidden group-hover:text-zinc-300 transition-colors">
                    <span className="text-3xl shrink-0 p-2 rounded-xl bg-[#050505]/60 border border-zinc-800">
                      {p.emoji || "🚀"}
                    </span>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-base text-zinc-100 truncate">{p.name}</h3>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <UserIcon className="w-3 h-3 text-zinc-500" />
                        <span className="truncate">{p.createdBy?.name || "Team member"}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.name)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {p.description || "No project description provided."}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {p.taskCount ?? 0} {p.taskCount === 1 ? "task" : "tasks"}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  href={`/app/projects/${p.id}`}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200/10 border border-zinc-500/25 text-zinc-400 group-hover:bg-zinc-300 group-hover:text-black font-medium text-xs flex items-center gap-1 transition-all"
                >
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold text-zinc-100">Create New Project</h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Select Icon / Emoji
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setCreateEmoji(e)}
                      className={`p-2 rounded-xl text-lg border transition-all ${
                        createEmoji === e
                          ? "bg-zinc-200/30 border-zinc-500 scale-110"
                          : "bg-[#050505]/60 border-zinc-800 hover:bg-zinc-800"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. E-Commerce Platform"
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Milestones, goals, and technical requirements..."
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black font-medium text-sm rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold text-zinc-100">Edit Project</h2>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Select Icon / Emoji
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEditEmoji(e)}
                      className={`p-2 rounded-xl text-lg border transition-all ${
                        editEmoji === e
                          ? "bg-zinc-200/30 border-zinc-500 scale-110"
                          : "bg-[#050505]/60 border-zinc-800 hover:bg-zinc-800"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black font-medium text-sm rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
