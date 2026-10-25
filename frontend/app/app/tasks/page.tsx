"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useEffect, useEffectEvent, useRef, useState } from "react";
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
  Kanban,
  List,
  Send,
  Search,
  ArrowUpDown,
  Circle,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
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
  const toastIdRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");

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
    const id = String(++toastIdRef.current);
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
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to load tasks data"));
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

  const refreshInitialData = useEffectEvent(() => {
    void loadInitialData();
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshInitialData, 0);
    return () => window.clearTimeout(timeoutId);
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
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err, "Failed to create task"));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      await taskService.updateTask(task.id, { status: newStatus });
      showToast("success", `Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update status"));
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
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete task"));
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
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update task"));
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
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to add comment"));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeTask) return;
    try {
      await taskService.deleteComment(activeTask.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast("success", "Comment deleted");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete comment"));
    }
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-zinc-400">Please select a workspace.</div>;
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-h-screen pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-zinc-700/20 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
            {currentWorkspace.name} / Tasks
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            Task Management
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Plan, track, and complete work across your projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-[#121212] border border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === "kanban" ? "bg-zinc-200 text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Kanban className="w-4 h-4" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === "list" ? "bg-zinc-200 text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-black rounded-xl text-sm font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0a0a] p-3 rounded-2xl border border-zinc-800/80 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest shrink-0 mr-3">
            Project
          </span>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectSelect(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedProjectId === p.id
                  ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 shadow-inner"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <span>{p.emoji || "🚀"}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#121212] border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors w-48 placeholder:text-zinc-600"
            />
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            className="bg-[#121212] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-[#121212]/50 rounded-2xl border border-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center bg-[#0a0a0a]/50 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-zinc-200 font-semibold text-lg mb-1">No projects found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            Create a project in this workspace first to start managing tasks.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* TODO Column */}
          <div className="flex flex-col bg-gradient-to-b from-[#121212] to-[#0a0a0a] rounded-[20px] border border-zinc-800/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between border-b border-zinc-800/50 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-sm text-zinc-300">To Do</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium ml-1">
                  {todoTasks.length}
                </span>
              </div>
              <button onClick={() => { setStatus("TODO"); setIsCreateOpen(true); }} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-3 min-h-[150px]">
              {todoTasks.length === 0 ? (
                <EmptyColumnState onAdd={() => { setStatus("TODO"); setIsCreateOpen(true); }} />
              ) : (
                todoTasks.map((t, i) => (
                  <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                    <TaskCard task={t} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onClick={() => openTaskDetail(t)} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div className="flex flex-col bg-gradient-to-b from-[#121212] to-[#0a0a0a] rounded-[20px] border border-zinc-800/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between border-b border-zinc-800/50 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
                <span className="font-semibold text-sm text-amber-400/90">In Progress</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/90 text-xs font-medium ml-1">
                  {inProgressTasks.length}
                </span>
              </div>
              <button onClick={() => { setStatus("IN_PROGRESS"); setIsCreateOpen(true); }} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-3 min-h-[150px]">
              {inProgressTasks.length === 0 ? (
                <EmptyColumnState onAdd={() => { setStatus("IN_PROGRESS"); setIsCreateOpen(true); }} />
              ) : (
                inProgressTasks.map((t, i) => (
                  <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                    <TaskCard task={t} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onClick={() => openTaskDetail(t)} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DONE Column */}
          <div className="flex flex-col bg-gradient-to-b from-[#121212] to-[#0a0a0a] rounded-[20px] border border-zinc-800/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between border-b border-zinc-800/50 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-sm text-emerald-500/90">Done</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500/90 text-xs font-medium ml-1">
                  {doneTasks.length}
                </span>
              </div>
              <button onClick={() => { setStatus("DONE"); setIsCreateOpen(true); }} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-3 min-h-[150px]">
              {doneTasks.length === 0 ? (
                <EmptyColumnState onAdd={() => { setStatus("DONE"); setIsCreateOpen(true); }} />
              ) : (
                doneTasks.map((t, i) => (
                  <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                    <TaskCard task={t} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onClick={() => openTaskDetail(t)} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-[#0a0a0a] rounded-[20px] border border-zinc-800/60 shadow-lg overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">No tasks found matching your criteria.</div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTaskDetail(t)}
                  className="p-4 hover:bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t, e.target.value as TaskStatus)}
                        className={`text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none border appearance-none cursor-pointer transition-colors ${
                          t.status === "TODO" ? "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20" :
                          t.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-zinc-200 truncate block group-hover:text-white transition-colors">{t.title}</span>
                      {t.description && <span className="text-xs text-zinc-500 truncate block mt-0.5">{t.description}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0 pl-16 sm:pl-0">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                        t.priority === "HIGH"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : t.priority === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                    
                    {t.assignee && (
                      <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                        <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-300 font-bold uppercase">
                          {t.assignee.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[80px]">{t.assignee.name}</span>
                      </div>
                    )}

                    {t.dueDate && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(t.id);
                      }}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


            {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">Create New Task</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
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
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji || "🚀"} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build authentication logic"
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and acceptance criteria..."
                  rows={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
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
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#050505]/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-sm font-medium rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
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
                    <div key={c.id} className="nx-card p-3 border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-bold text-zinc-200">{c.user?.name || "Member"}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button onClick={() => handleDeleteComment(c.id)} className="text-zinc-500 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-300">{c.content}</p>
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

function EmptyColumnState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center border-2 border-dashed border-zinc-800/50 rounded-xl bg-zinc-900/20">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-3 shadow-inner">
        <CheckSquare className="w-4 h-4 text-zinc-500" />
      </div>
      <p className="text-xs text-zinc-400 mb-3 font-medium">No tasks here</p>
      <button 
        onClick={onAdd}
        className="text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700 shadow-sm"
      >
        + Add task
      </button>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onClick,
  onDelete,
}: {
  task: Task;
  onStatusChange: (t: Task, s: TaskStatus) => void;
  onClick: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-4 rounded-[16px] bg-gradient-to-b from-[#181818] to-[#121212] border border-white/5 hover:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transform transition-all duration-300 cursor-pointer hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] overflow-hidden"
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
              task.priority === "HIGH"
                ? "text-red-400 bg-red-500/10 border border-red-500/20"
                : task.priority === "MEDIUM"
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                : "text-zinc-400 bg-zinc-800 border border-zinc-700"
            }`}
          >
            {task.priority}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">
            #{task.id.slice(0, 5).toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <div className="relative inline-block">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                className="appearance-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium rounded px-2 py-1 pr-6 border border-zinc-700 outline-none cursor-pointer transition-colors shadow-sm"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-2 leading-tight mb-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
              <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-[9px] text-zinc-200 font-bold uppercase shadow-sm">
                {task.assignee.name.charAt(0)}
              </div>
              <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[80px]">
                {task.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-zinc-600 flex items-center justify-center" title="Unassigned">
              <span className="text-zinc-600 text-[10px]">?</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-zinc-500">
          {task.dueDate && (
            <div className="flex items-center gap-1.5" title="Due date">
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          
          {(task.comments?.length || 0) > 0 && (
            <div className="flex items-center gap-1" title={`${task.comments?.length} comments`}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{task.comments?.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
