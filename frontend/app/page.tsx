"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  Kanban,
  MessageSquare,
  FileText,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  FolderGit2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-zinc-300 selection:text-zinc-100 overflow-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-zinc-200/10 border border-zinc-500/30 text-zinc-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display text-metallic">
              Nexora
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#projects" className="hover:text-zinc-100 transition-colors">Projects</a>
            <a href="#chat" className="hover:text-zinc-100 transition-colors">Collaboration</a>
            <a href="#ai" className="hover:text-zinc-100 transition-colors">AI Planning</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl shadow-lg shadow-zinc-400/20 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zinc-200/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/10 border border-zinc-500/25 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-8 anim-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            The All-In-One Workspace for Modern Teams
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 mb-6 max-w-4xl mx-auto leading-[1.1] anim-scale-in">
            Plan. Collaborate. <span className="text-metallic">Build.</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed anim-fade-up stagger-2">
            Nexora brings project planning, tasks, real-time team channels, documentation, and file management into one seamless, high-velocity workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 anim-fade-up stagger-3">
            <Link
              href="/register"
              className="nx-btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="nx-btn-ghost w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
            >
              <span>Sign In to Workspace</span>
            </Link>
          </div>

          {/* Product Dashboard Visual Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-zinc-500/20 via-zinc-800/40 to-zinc-950/80 border border-zinc-500/30 shadow-2xl shadow-black/60 anim-scale-in stagger-4 hover:scale-[1.01] transition-transform duration-700">
            <div className="bg-[#121212] rounded-xl overflow-hidden border border-zinc-800 text-left">
              {/* Fake Window Header */}
              <div className="px-4 py-3 bg-[#050505] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs font-mono text-zinc-500">nexora.app / workspace / engineering</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Backend API Connected</span>
                </div>
              </div>

              {/* Mock Dashboard Body */}
              <div className="p-6 grid grid-cols-12 gap-6 bg-[#121212]/95">
                {/* Mock Sidebar */}
                <div className="col-span-3 hidden md:block space-y-4 border-r border-zinc-800/60 pr-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/60 text-sm font-semibold text-zinc-100">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    Acme Engineering
                  </div>
                  <div className="space-y-1 text-xs text-zinc-400 font-medium">
                    <div className="p-2 rounded bg-zinc-200/10 text-zinc-300 font-semibold flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4" /> Overview
                    </div>
                    <div className="p-2 hover:bg-zinc-800/40 rounded flex items-center gap-2">
                      <Kanban className="w-4 h-4" /> Projects & Tasks
                    </div>
                    <div className="p-2 hover:bg-zinc-800/40 rounded flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Team Channels
                    </div>
                    <div className="p-2 hover:bg-zinc-800/40 rounded flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Documents
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">Workspace Overview</h3>
                      <p className="text-xs text-zinc-400">Active projects & team activity</p>
                    </div>
                    <span className="px-3 py-1 bg-zinc-200/10 border border-zinc-500/30 text-zinc-300 rounded-lg text-xs font-medium">
                      + New Project
                    </span>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#050505]/60 border border-zinc-800 rounded-lg">
                      <div className="text-xs text-zinc-400">Active Projects</div>
                      <div className="text-xl font-bold text-zinc-100 mt-1">8</div>
                    </div>
                    <div className="p-3 bg-[#050505]/60 border border-zinc-800 rounded-lg">
                      <div className="text-xs text-zinc-400">Tasks Completed</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">42 / 56</div>
                    </div>
                    <div className="p-3 bg-[#050505]/60 border border-zinc-800 rounded-lg">
                      <div className="text-xs text-zinc-400">Team Members</div>
                      <div className="text-xl font-bold text-zinc-400 mt-1">12</div>
                    </div>
                  </div>

                  {/* Task Columns */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#050505]/40 border border-zinc-800 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                        <span>TO DO</span>
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">3</span>
                      </div>
                      <div className="p-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded text-xs text-zinc-200">
                        Design Socket.IO Chat Client
                      </div>
                      <div className="p-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded text-xs text-zinc-200">
                        Setup Cloudinary Storage
                      </div>
                    </div>

                    <div className="p-3 bg-[#050505]/40 border border-zinc-800 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                        <span>IN PROGRESS</span>
                        <span className="bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">2</span>
                      </div>
                      <div className="p-2.5 bg-zinc-200/5 border border-zinc-500/30 rounded text-xs text-zinc-200 font-medium">
                        Build Axios API Integration Layer
                      </div>
                    </div>

                    <div className="p-3 bg-[#050505]/40 border border-zinc-800 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                        <span>DONE</span>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">5</span>
                      </div>
                      <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded text-xs text-emerald-300">
                        Setup JWT Auth Controller
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 border-t border-zinc-800/80 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Everything your engineering & product team needs
            </h2>
            <p className="text-zinc-400 text-base">
              No more context switching across five different apps. Nexora unifies every workflow into one centralized platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 nx-card hover:border-zinc-500/40 transition-all">
              <div className="nx-stat-icon w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2 font-display">Project Management</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Create projects per workspace, assign owners, set up milestones, and track overall progress in real time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="nx-card p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Task Management & Kanban</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Filter tasks by status and priority, assign team members, set due dates, and post inline comments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="nx-card p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Real-Time Team Channels</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instant Socket.IO messaging within channels, typing indicators, and message history for frictionless team communication.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="nx-card p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Workspace Documentation</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Collaborative document editor for technical specs, product guidelines, and meeting notes right inside your projects.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="nx-card p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Cloudinary File Storage</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Upload design assets, documentation attachments, and binary files with Cloudinary integration and instant download links.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="nx-card p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-200/10 border border-zinc-500/30 flex items-center justify-center text-zinc-400 mb-5">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Real-Time Notifications</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Stay updated when tasks are assigned to you, mentioned in comments, or updated by team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Teaser Section */}
      <section id="ai" className="py-20 border-t border-zinc-800/80 bg-gradient-to-b from-[#050505] to-zinc-900/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#1a1a1a] via-[#0c0c0c] to-black border border-zinc-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-200/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/15 text-zinc-300 text-xs font-semibold mb-4 border border-zinc-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Nexora AI Project Planner
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
                Smart project planning powered by AI
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed mb-6">
                Tell Nexora AI what you want to build (e.g. <em>"I want to build an e-commerce platform with React, Node.js and PostgreSQL"</em>) and automatically generate structured project phases, tasks, document outlines, and technical milestones.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-black font-medium text-sm rounded-xl shadow-lg shadow-zinc-400/20 transition-all"
              >
                Start Planning with AI
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800/80 bg-[#050505] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-zinc-100">Nexora</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-zinc-300 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
