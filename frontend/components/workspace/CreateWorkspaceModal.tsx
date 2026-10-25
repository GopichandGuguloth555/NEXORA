"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { X, Layers, Loader2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    try {
      setLoading(true);
      await createWorkspace(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create workspace"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0e0e0e] border border-zinc-700/60 rounded-2xl p-6 shadow-2xl space-y-6 relative anim-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-300">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 font-display">Create New Workspace</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering Team"
              required
              className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary workspace for project planning and team discussion"
              rows={3}
              className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black font-medium text-sm rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
