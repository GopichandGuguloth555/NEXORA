"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { aiService } from "@/lib/services/ai.service";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { documentService } from "@/lib/services/document.service";
import { AIProjectPlan, AITask, TaskPriority } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  ListTodo,
  FileText,
  Loader2,
  Edit3,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  FolderGit2,
  Send,
} from "lucide-react";

export default function AIPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<AIProjectPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  // Assistant State
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);

  const samplePrompts = [
    "Build an e-commerce platform with React, Node.js, PostgreSQL and Stripe...",
    "Real-time chat & team collaboration software with channels and notifications.",
    "SaaS Analytics dashboard with multi-tenant workspaces and automated PDF reports.",
  ];

  const loadingStepsText = [
    "Analyzing project idea...",
    "Structuring project phases...",
    "Generating tasks & priorities...",
    "Preparing documentation & setup guides...",
  ];

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGeneratePlan = async (inputPrompt: string) => {
    const trimmed = inputPrompt.trim();
    if (trimmed.length < 10) {
      showToast("error", "Please describe your project idea in at least 10 characters.");
      return;
    }

    if (!currentWorkspace) {
      showToast("error", "Please select a workspace first.");
      return;
    }

    try {
      setGenerating(true);
      setLoadingStep(0);
      setPlan(null);
      setIsEditing(false);

      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 700);

      const res = await aiService.generatePlan(trimmed, currentWorkspace.id);

      clearInterval(stepInterval);

      if (res.success && res.data) {
        setPlan(res.data);
        showToast("success", "Project plan generated successfully!");
      }
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to generate AI project plan."));
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskChange = (phaseIdx: number, taskIdx: number, key: keyof AITask, val: string) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    const newTasks = [...newPhases[phaseIdx].tasks];
    newTasks[taskIdx] = { ...newTasks[taskIdx], [key]: val };
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], tasks: newTasks };
    setPlan({ ...plan, phases: newPhases });
  };

  const handleAddTask = (phaseIdx: number) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    newPhases[phaseIdx].tasks.push({
      title: "New Actionable Task",
      description: "Specify task details here...",
      priority: "MEDIUM",
    });
    setPlan({ ...plan, phases: newPhases });
  };

  const handleDeleteTask = (phaseIdx: number, taskIdx: number) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    newPhases[phaseIdx].tasks.splice(taskIdx, 1);
    setPlan({ ...plan, phases: newPhases });
  };

  const handleCreateRealProject = async () => {
    if (!plan || !currentWorkspace) return;

    try {
      setCreatingProject(true);

      // 1. Create Real Workspace Project
      const projRes = await projectService.createProject(currentWorkspace.id, {
        name: plan.name,
        description: plan.description,
        emoji: "🚀",
      });

      if (!projRes.success || !projRes.data) {
        throw new Error(projRes.message || "Failed to create project");
      }

      const createdProject = projRes.data;

      // 2. Create Real Backend Tasks
      let taskCount = 0;
      for (const phase of plan.phases) {
        for (const task of phase.tasks) {
          await taskService.createTask(createdProject.id, {
            title: task.title,
            description: `[${phase.name}] ${task.description}`,
            status: "TODO",
            priority: task.priority || "MEDIUM",
          });
          taskCount++;
        }
      }

      showToast("success", `Project "${createdProject.name}" and ${taskCount} tasks created successfully!`);

      // 3. Navigate to new project
      setTimeout(() => {
        router.push(`/app/projects?id=${createdProject.id}`);
      }, 1000);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to create project & tasks"));
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveDocumentation = async () => {
    if (!plan || !currentWorkspace) return;

    try {
      setSavingDocs(true);
      let docCount = 0;
      for (const doc of plan.documentation) {
        await documentService.createDocument(currentWorkspace.id, {
          title: doc.title,
          content: doc.content,
        });
        docCount++;
      }
      showToast("success", `${docCount} documents saved to workspace successfully!`);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to save documentation"));
    } finally {
      setSavingDocs(false);
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantPrompt.trim()) return;

    try {
      setAssistantLoading(true);
      const res = await aiService.askAssistant(assistantPrompt, plan ? plan.name : undefined);
      if (res.success && res.data) {
        setAssistantReply(res.data.reply);
      }
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Assistant inquiry failed"));
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Hero Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-[#1a1a1a] via-[#0c0c0c] to-black border border-zinc-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/15 text-zinc-300 border border-zinc-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>AI Project Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Plan your next project with AI
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Describe what you want to build and Nexora will help turn your idea into a structured project plan with actionable tasks and technical documentation.
          </p>
        </div>
      </div>

      {/* Main Input Box */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#161616]/95 to-[#0a0a0a]/95 border border-white/5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transform transition-transform hover:-translate-y-0.5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04),_transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            What are you building? *
          </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Build an e-commerce platform with React, Node.js, PostgreSQL and Stripe..."
          className="w-full bg-[#050505]/70 border border-zinc-800 focus:border-zinc-400 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none leading-relaxed resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Sample Prompts */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-zinc-500 font-medium">Examples:</span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s)}
                className="px-2.5 py-1 rounded-xl bg-[#050505]/80 border border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:border-zinc-500/30 transition-all text-left text-[11px]"
              >
                &quot;{s.slice(0, 32)}...&quot;
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGeneratePlan(prompt)}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-zinc-100 font-semibold text-sm rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0 justify-center"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Generate Project Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Progress State */}
        {generating && (
          <div className="p-4 rounded-2xl bg-zinc-200/5 border border-zinc-500/30 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span>{loadingStepsText[loadingStep]}</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* AI Generated Review Screen */}
      {plan && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212]/95 border border-zinc-500/30 space-y-8 shadow-2xl">
          {/* Review Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-zinc-100">{plan.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI PLAN READY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{plan.description}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-zinc-400" />
                <span>{isEditing ? "Done Editing" : "Edit Plan"}</span>
              </button>

              <button
                onClick={handleCreateRealProject}
                disabled={creatingProject}
                className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-xs font-bold rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
              >
                {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderGit2 className="w-4 h-4" />}
                <span>Create Project</span>
              </button>
            </div>
          </div>

          {/* Goals & Tech Stack Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-[#050505]/60 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Project Goals</h4>
              <ul className="space-y-1">
                {plan.goals.map((g, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#050505]/60 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recommended Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plan.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-zinc-200/10 text-zinc-300 border border-zinc-500/25 text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phases & Tasks Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-zinc-400" />
                <span>Project Phases & Tasks</span>
              </h3>
            </div>

            <div className="space-y-4">
              {plan.phases.map((phase, pIdx) => (
                <div key={pIdx} className="p-5 rounded-2xl bg-[#050505]/70 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-300">{phase.name}</h4>
                      <p className="text-xs text-zinc-400">{phase.description}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleAddTask(pIdx)}
                        className="px-2.5 py-1 bg-zinc-200/10 hover:bg-zinc-200 text-zinc-300 hover:text-black rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Task
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {phase.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl bg-[#121212]/90 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleTaskChange(pIdx, tIdx, "title", e.target.value)}
                              className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none font-semibold"
                            />
                            <textarea
                              value={task.description}
                              onChange={(e) => handleTaskChange(pIdx, tIdx, "description", e.target.value)}
                              rows={2}
                              className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 outline-none"
                            />
                            <div className="flex items-center justify-between">
                              <select
                                value={task.priority}
                                onChange={(e) =>
                                  handleTaskChange(pIdx, tIdx, "priority", e.target.value as TaskPriority)
                                }
                                className="bg-[#050505] border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-100 outline-none"
                              >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                              </select>

                              <button
                                onClick={() => handleDeleteTask(pIdx, tIdx)}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h5 className="font-semibold text-xs text-zinc-100">{task.title}</h5>
                              <p className="text-xs text-zinc-400 leading-normal">{task.description}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                task.priority === "HIGH"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : task.priority === "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Documentation Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Generated Technical Documentation</span>
              </h3>

              <button
                onClick={handleSaveDocumentation}
                disabled={savingDocs}
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-zinc-100 rounded-xl text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingDocs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Documentation to Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.documentation.map((doc, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#050505]/70 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-xs text-amber-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>{doc.title}</span>
                  </h4>
                  <div className="text-xs text-zinc-300 font-mono bg-[#121212] p-3 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Widget */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#161616]/95 to-[#0a0a0a]/95 border border-white/5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transform transition-transform hover:-translate-y-0.5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04),_transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span>Nexora AI Assistant</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Ask Nexora AI technical architecture questions or request task breakdown recommendations.
          </p>

        <form onSubmit={handleAskAssistant} className="flex items-center gap-2">
          <input
            type="text"
            value={assistantPrompt}
            onChange={(e) => setAssistantPrompt(e.target.value)}
            placeholder="e.g. What should I build first?"
            className="flex-1 bg-[#050505]/80 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
          />
          <button
            type="submit"
            disabled={assistantLoading}
            className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
          >
            {assistantLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </button>
        </form>

        {assistantReply && (
          <div className="p-4 rounded-2xl bg-zinc-200/5 border border-zinc-500/30 text-xs text-zinc-200 leading-relaxed font-sans">
            <span className="font-bold text-zinc-300 block mb-1">Nexora AI Response:</span>
            {assistantReply}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
