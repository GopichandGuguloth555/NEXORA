"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-center justify-between gap-3 text-xs font-medium animate-slide-up transition-all ${
        toast.type === "success"
          ? "bg-[#121212] border-emerald-500/40 text-emerald-300"
          : toast.type === "error"
          ? "bg-[#121212] border-red-500/40 text-red-300"
          : "bg-[#121212] border-zinc-500/40 text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
        <span className="truncate">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
