"use client";

import React from "react";
import { Layers } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Loading Nexora...",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "min-h-[60vh]"
      } bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[280px] bg-zinc-400/10 rounded-full blur-[100px] anim-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-zinc-500/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 anim-scale-in">
        {/* Logo mark */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-zinc-300/20 blur-xl anim-pulse-silver" />
          <div className="relative p-5 rounded-2xl bg-zinc-200/10 border border-zinc-500/40 text-zinc-200 shadow-2xl anim-float">
            <Layers className="w-10 h-10" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-metallic">
            Nexora
          </h1>
          <p className="text-sm text-zinc-500 tracking-wide">{message}</p>
        </div>

        {/* Spinner ring */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-300 border-r-zinc-500 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-zinc-400 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
          />
        </div>

        {/* Progress shimmer bar */}
        <div className="w-48 h-1 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
