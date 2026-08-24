"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Project, Task, TaskPriority, TaskStatus, WorkspaceMember, Comment } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  CheckSquare,
  Clock,
  CheckCircle2,
  User as UserIcon,
  Calendar,
  MessageSquare,
  Kanban,
  List,
  ArrowLeft,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Edit Project Modal
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editEmoji, setEditEmoji] = useState("🚀");
  const [updatingProject, setUpdatingProject] = useState(false);

  // Create Task Modal
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("TODO");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("MEDIUM");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);

  // Task Detail Modal / Side Panel
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailDesc, setDetailDesc] = useState("");
  const [detailStatus, setDetailStatus] = useState<TaskStatus>("TODO");
  const [detailPriority, setDetailPriority] = useState<TaskPriority>("MEDIUM");
  const [detailAssigneeId, setDetailAssigneeId] = useState("");
  const [detailDueDate, setDetailDueDate] = useState("");
  const [updatingTask, setUpdatingTask] = useState(false);

  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const projRes = await projectService.getProjectById(projectId);
      if (!projRes.success || !projRes.data) {
        setError("Project not found or accessible");
        return;
      }
      setProject(projRes.data);
      setEditName(projRes.data.name);
      setEditDesc(projRes.data.description || "");
      setEditEmoji(projRes.data.emoji || "🚀");

      // Fetch tasks for project
      const tasksRes = await taskService.getTasks(projectId);
      setTasks(tasksRes.data || []);

      // Fetch workspace members for assignee select
      if (currentWorkspace) {
        const memRes = await workspaceService.getMembers(currentWorkspace.id);
        setMembers(memRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId, currentWorkspace]);

  // Project Edit & Delete Handlers
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      setUpdatingProject(true);
      const res = await projectService.updateProject(project.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        emoji: editEmoji,
      });
      if (res.success && res.data) {
        setProject(res.data);
        setIsEditProjectOpen(false);
        showToast("success", "Project updated!");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update project");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) return;

    try {
      await projectService.deleteProject(project.id);
      showToast("success", "Project deleted successfully");
      router.push("/app/projects");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete project");
    }
  };

  // Task Creation Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTaskError(null);

    if (taskTitle.trim().length < 3) {
      setCreateTaskError("Task title must be at least 3 characters");
      return;
    }

    try {
      setCreatingTask(true);
      const res = await taskService.createTask(projectId, {
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        status: taskStatus,
        priority: taskPriority,
        assigneeId: taskAssigneeId || undefined,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      });

      if (res.success && res.data) {
        showToast("success", `Task "${res.data.title}" created!`);
        setTaskTitle("");
        setTaskDesc("");
        setTaskDueDate("");
        setTaskAssigneeId("");
        setIsCreateTaskOpen(false);
        // Refresh tasks
        const updated = await taskService.getTasks(projectId);
        setTasks(updated.data || []);
      }
    } catch (err: any) {
      setCreateTaskError(err.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  // Inline Status Quick Change
  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      await taskService.updateTask(task.id, { status: newStatus });
      showToast("success", `Task status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update task status");
      // Revert on error
      const updated = await taskService.getTasks(projectId);
      setTasks(updated.data || []);
    }
  };

  // Open Task Detail Drawer / Modal
  const openTaskDetail = async (task: Task) => {
    setActiveTask(task);
    setDetailTitle(task.title);
    setDetailDesc(task.description || "");
    setDetailStatus(task.status);
    setDetailPriority(task.priority);
    setDetailAssigneeId(task.assigneeId || "");
    setDetailDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");

    try {
      setLoadingComments(true);
      const commentsRes = await taskService.getComments(task.id);
      setComments(commentsRes.data || []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSaveTaskDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    if (detailTitle.trim().length < 3) {
      showToast("error", "Task title must be at least 3 characters");
      return;
    }

    try {
      setUpdatingTask(true);
      const res = await taskService.updateTask(activeTask.id, {
        title: detailTitle.trim(),
        description: detailDesc.trim() || undefined,
        status: detailStatus,
        priority: detailPriority,
        assigneeId: detailAssigneeId || null,
        dueDate: detailDueDate ? new Date(detailDueDate).toISOString() : null,
      });

      if (res.success && res.data) {
        showToast("success", "Task details saved!");
        setActiveTask(res.data);
        const updated = await taskService.getTasks(projectId);
        setTasks(updated.data || []);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update task details");
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      showToast("success", "Task deleted");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTask?.id === taskId) setActiveTask(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete task");
    }
  };

  // Comment Handlers
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !newComment.trim()) return;

    try {
      const res = await taskService.createComment(activeTask.id, newComment.trim());
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
        showToast("success", "Comment added");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeTask) return;
    try {
      await taskService.deleteComment(activeTask.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast("success", "Comment deleted");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete comment");
    }
  };

  // Render Skeleton / Error
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-20 bg-[#121212]/70 rounded-2xl border border-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-[#121212]/70 rounded-2xl border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-[#121212]/70 rounded-2xl border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-12 text-center bg-[#121212]/90 rounded-3xl border border-zinc-800 max-w-md mx-auto my-12 space-y-4 shadow-xl">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-100">Project Not Found</h2>
        <p className="text-xs text-zinc-400">{error || "The requested project does not exist or you do not have permission to view it."}</p>
        <Link
          href="/app/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  // Calculate task counts
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/app/projects" className="hover:text-zinc-100 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Projects
        </Link>
        <span>/</span>
        <span className="text-zinc-200 font-semibold">{project.name}</span>
      </div>

      {/* Project Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121212]/95 border border-zinc-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-4xl p-3 rounded-2xl bg-[#050505]/60 border border-zinc-800 shrink-0">
              {project.emoji || "🚀"}
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">{project.name}</h1>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {project.description || "No project description available."}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Created by {project.createdBy?.name || "Team member"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditProjectOpen(true)}
              className="p-2.5 rounded-xl bg-[#050505]/60 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDeleteProject}
              className="p-2.5 rounded-xl bg-[#050505]/60 border border-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-black text-xs font-semibold rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>
      </div>

      {/* Task Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121212]/90 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-200/10 text-zinc-400 border border-zinc-500/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold uppercase">Total Tasks</div>
            <div className="text-xl font-bold text-zinc-100 mt-0.5">{tasks.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212]/90 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold uppercase">To Do</div>
            <div className="text-xl font-bold text-zinc-200 mt-0.5">{todoTasks.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212]/90 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold uppercase">In Progress</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{inProgressTasks.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212]/90 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold uppercase">Completed</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{doneTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Task Board Controls */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <span>Project Board</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
            {tasks.length} tasks
          </span>
        </h2>

        <div className="p-1 rounded-xl bg-[#121212] border border-zinc-800 flex items-center gap-1">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "kanban" ? "bg-zinc-200 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Board
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "list" ? "bg-zinc-200 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {/* Tasks View: Kanban vs List */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div className="p-4 rounded-2xl bg-[#121212]/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-zinc-300 pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                TO DO
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {todoTasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs italic">No tasks in TODO</div>
              ) : (
                todoTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onStatusChange={handleQuickStatusChange}
                    onDelete={handleDeleteTask}
                    onClick={() => openTaskDetail(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div className="p-4 rounded-2xl bg-[#121212]/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-amber-400 pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                IN PROGRESS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {inProgressTasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs italic">No tasks in progress</div>
              ) : (
                inProgressTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onStatusChange={handleQuickStatusChange}
                    onDelete={handleDeleteTask}
                    onClick={() => openTaskDetail(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* DONE Column */}
          <div className="p-4 rounded-2xl bg-[#121212]/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-emerald-400 pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                DONE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {doneTasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs italic">No completed tasks</div>
              ) : (
                doneTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onStatusChange={handleQuickStatusChange}
                    onDelete={handleDeleteTask}
                    onClick={() => openTaskDetail(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="p-4 rounded-2xl bg-[#121212]/90 border border-zinc-800 space-y-2">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">No tasks found</div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => openTaskDetail(t)}
                className="p-3.5 rounded-xl bg-[#050505]/60 hover:bg-[#050505] border border-zinc-800 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <select
                    value={t.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleQuickStatusChange(t, e.target.value as TaskStatus)}
                    className="bg-[#121212] border border-zinc-700 text-xs rounded-lg px-2 py-1 text-zinc-200 outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  <span className="font-semibold text-sm text-zinc-100 truncate">{t.title}</span>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  {t.assignee && (
                    <span className="text-[11px] text-zinc-400">👤 {t.assignee.name}</span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.priority === "HIGH"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : t.priority === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(t.id);
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">Edit Project</h2>
              <button onClick={() => setIsEditProjectOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProjectOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProject}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black font-medium text-sm rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {updatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold text-zinc-100">Create New Task</h2>
              </div>
              <button onClick={() => setIsCreateTaskOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createTaskError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {createTaskError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement authentication logic"
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task details and acceptance criteria..."
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Assignee</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-sm font-medium rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {creatingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal / Side Panel */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Task Detail Modal
                </span>
                <h2 className="text-lg font-bold text-zinc-100 mt-0.5">{activeTask.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteTask(activeTask.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveTask(null)} className="p-1 text-zinc-400 hover:text-zinc-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Task Form Fields */}
            <form onSubmit={handleSaveTaskDetail} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={detailTitle}
                  onChange={(e) => setDetailTitle(e.target.value)}
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Description</label>
                <textarea
                  value={detailDesc}
                  onChange={(e) => setDetailDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Status</label>
                  <select
                    value={detailStatus}
                    onChange={(e) => setDetailStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Priority</label>
                  <select
                    value={detailPriority}
                    onChange={(e) => setDetailPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Assignee</label>
                  <select
                    value={detailAssigneeId}
                    onChange={(e) => setDetailAssigneeId(e.target.value)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={detailDueDate}
                    onChange={(e) => setDetailDueDate(e.target.value)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
                <span>Created by: {activeTask.createdBy?.name || "Member"}</span>
                <span>Created: {new Date(activeTask.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updatingTask}
                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Updates"}
                </button>
              </div>
            </form>

            {/* Comments Thread */}
            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>Comments ({comments.length})</span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {loadingComments ? (
                  <div className="py-4 text-center">
                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin mx-auto" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-xs text-zinc-500 py-2 text-center italic">No comments yet</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-[#050505]/60 border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-bold text-zinc-200">{c.user?.name || "Member"}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-300">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-[#050505]/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                />
                <button
                  type="submit"
                  className="p-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-medium"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
  onClick,
}: {
  task: Task;
  onStatusChange: (t: Task, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl bg-[#050505]/80 hover:bg-[#050505] border border-zinc-800 hover:border-zinc-500/40 transition-all space-y-3 cursor-pointer group shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-xs text-zinc-100 group-hover:text-zinc-300 transition-colors line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-0.5"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px]">
        <span
          className={`px-2 py-0.5 rounded font-semibold ${
            task.priority === "HIGH"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : task.priority === "MEDIUM"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {task.priority}
        </span>

        {task.assignee && (
          <span className="text-zinc-400 truncate max-w-[100px]" title={task.assignee.name}>
            👤 {task.assignee.name}
          </span>
        )}

        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
          className="bg-[#121212] border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 outline-none"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>
    </div>
  );
}
