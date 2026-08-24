"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Layers, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden">
      {/* Background Graphic & Subtle Glow */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 filter blur-xs"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-zinc-900/40 z-0" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-zinc-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#121212]/90 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50 anim-scale-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6 group">
            <div className="p-2.5 rounded-xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-300 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-display text-metallic">
              Nexora
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-400 mt-1">Sign in to your workspace to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Password
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Contact workspace admin to reset password"); }} className="text-xs text-zinc-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 font-medium text-sm text-black rounded-xl shadow-lg shadow-zinc-400/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-zinc-400 hover:text-zinc-300 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
