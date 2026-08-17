"use client";

import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Project, Task, TaskPriority, TaskStatus, WorkspaceMember, Comment } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  CheckSquare,
  Plus,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Filter,
  Kanban,
  List,
  Send,
} from "lucide-react";

export default function TasksPage() {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Create Task Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [targetProjectId, setTargetProjectId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const loadInitialData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const projRes = await projectService.getProjects(currentWorkspace.id);
      const projList = projRes.data || [];
      setProjects(projList);

      const memRes = await workspaceService.getMembers(currentWorkspace.id);
      setMembers(memRes.data || []);

      if (projList.length > 0) {
        const defaultProjId = projList[0].id;
        setSelectedProjectId(defaultProjId);
        setTargetProjectId(defaultProjId);
        await fetchTasksForProject(defaultProjId);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load tasks data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProject = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await taskService.getTasks(projectId);
      setTasks(res.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentWorkspace]);

  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    setTargetProjectId(projId);
    fetchTasksForProject(projId);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (title.trim().length < 3) {
      setCreateError("Task title must be at least 3 characters");
      return;
    }
    if (!targetProjectId) {
      setCreateError("Please select a target project");
      return;
    }

    try {
      setCreating(true);
      const res = await taskService.createTask(targetProjectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      if (res.success && res.data) {
        showToast("success", `Task "${res.data.title}" created!`);
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssigneeId("");
        setIsCreateOpen(false);
        if (targetProjectId === selectedProjectId) {
          fetchTasksForProject(selectedProjectId);
        }
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      await taskService.updateTask(task.id, { status: newStatus });
      showToast("success", `Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
      fetchTasksForProject(selectedProjectId);
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
      const res = await taskService.getComments(task.id);
      setComments(res.data || []);
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
        showToast("success", "Task updated!");
        setActiveTask(res.data);
        fetchTasksForProject(selectedProjectId);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update task");
    } finally {
      setUpdatingTask(false);
    }
  };

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

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-slate-400">Please select a workspace.</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kanban board & task tracking for <span className="text-indigo-300 font-semibold">{currentWorkspace.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === "kanban" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Project:
        </span>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProjectSelect(p.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              selectedProjectId === p.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <span>{p.emoji || "🚀"}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No projects available in this workspace. Please create a project first.
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                TO DO
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {todoTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  onClick={() => openTaskDetail(t)}
                />
              ))}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-amber-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                IN PROGRESS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {inProgressTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  onClick={() => openTaskDetail(t)}
                />
              ))}
            </div>
          </div>

          {/* DONE Column */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-emerald-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                DONE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {doneTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  onClick={() => openTaskDetail(t)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">No tasks found</div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => openTaskDetail(t)}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <select
                    value={t.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleUpdateStatus(t, e.target.value as TaskStatus)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  <span className="font-semibold text-sm text-white truncate">{t.title}</span>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  {t.assignee && <span className="text-[11px] text-slate-400">👤 {t.assignee.name}</span>}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.priority === "HIGH"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : t.priority === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(t.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji || "🚀"} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build authentication logic"
                  required
                  minLength={3}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and acceptance criteria..."
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Task Detail Modal
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{activeTask.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteTask(activeTask.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveTask(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveTaskDetail} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={detailTitle}
                  onChange={(e) => setDetailTitle(e.target.value)}
                  required
                  minLength={3}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  value={detailDesc}
                  onChange={(e) => setDetailDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={detailStatus}
                    onChange={(e) => setDetailStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Priority</label>
                  <select
                    value={detailPriority}
                    onChange={(e) => setDetailPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assignee</label>
                  <select
                    value={detailAssigneeId}
                    onChange={(e) => setDetailAssigneeId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={detailDueDate}
                    onChange={(e) => setDetailDueDate(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                <span>Created by: {activeTask.createdBy?.name || "Member"}</span>
                <span>Created: {new Date(activeTask.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updatingTask}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Updates"}
                </button>
              </div>
            </form>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Comments ({comments.length})</span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {loadingComments ? (
                  <div className="py-4 text-center">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mx-auto" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2 text-center italic">No comments yet</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-200">{c.user?.name || "Member"}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button onClick={() => handleDeleteComment(c.id)} className="text-slate-500 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
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
      className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 cursor-pointer group shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-0.5"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
        <span
          className={`px-2 py-0.5 rounded font-semibold ${
            task.priority === "HIGH"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : task.priority === "MEDIUM"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {task.priority}
        </span>

        {task.assignee && (
          <span className="text-slate-400 truncate max-w-[100px]" title={task.assignee.name}>
            👤 {task.assignee.name}
          </span>
        )}

        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>
    </div>
  );
}
