"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/lib/services/notification.service";
import { NotificationItem } from "@/lib/types";
import { Menu, Bell, Check, CheckCheck, Trash2, X, Clock } from "lucide-react";

interface AppHeaderProps {
  onMobileMenuClick: () => void;
}

export function AppHeader({ onMobileMenuClick }: AppHeaderProps) {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const { connected } = useSocket();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      }
    } catch {
      // Background notifications fetch
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      setMarkingAll(true);
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id, true)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Workspace Dashboard";
    if (pathname.includes("/projects")) return "Projects";
    if (pathname.includes("/tasks")) return "Tasks";
    if (pathname.includes("/chat")) return "Team Channels";
    if (pathname.includes("/documents")) return "Documents";
    if (pathname.includes("/files")) return "File Storage";
    if (pathname.includes("/notifications")) return "Notifications";
    if (pathname.includes("/members")) return "Members & Roles";
    if (pathname.includes("/ai")) return "AI Project Planner";
    return "Workspace";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-gradient-to-r from-[#121212]/90 to-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] px-4 flex items-center justify-between anim-fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-300 hover:scale-110"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500 font-medium hidden sm:inline">
            {currentWorkspace?.name || "Workspace"}
          </span>
          <span className="text-zinc-700 hidden sm:inline">/</span>
          <span className="text-zinc-100 font-semibold font-display tracking-tight">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 ${
            connected
              ? "bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-300"
              : "bg-gradient-to-b from-amber-900/50 to-amber-950/50 border-amber-800/50 text-amber-400"
          }`}
          title={connected ? "Socket.IO Live Sync Active" : "Connecting to Socket.IO..."}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${
              connected ? "bg-zinc-100 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{connected ? "Live Sync" : "Offline"}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-300 hover:scale-110 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-zinc-200 text-black font-bold text-[10px] flex items-center justify-center border-2 border-[#080808] animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-[#0e0e0e] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-4 space-y-3 anim-scale-in">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100 font-display">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200/15 text-zinc-300 border border-zinc-500/30 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={markingAll}
                      className="text-[11px] text-zinc-400 hover:text-zinc-100 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-xs">No notifications yet</div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n.id}
                      style={{ animationDelay: `${i * 0.04}s` }}
                      className={`anim-fade-up p-3 rounded-xl border text-xs space-y-1.5 transition-all duration-300 relative group hover:scale-[1.02] ${
                        n.isRead
                          ? "bg-black/40 border-zinc-800/60 text-zinc-500"
                          : "bg-zinc-200/5 border-zinc-500/40 text-zinc-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-zinc-100 leading-tight">{n.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="p-1 rounded text-zinc-400 hover:bg-zinc-700/40"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            className="p-1 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] leading-relaxed text-zinc-400">{n.message}</p>

                      <div className="flex items-center justify-between text-[10px] text-zinc-600 pt-1 border-t border-zinc-800/40">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                          {n.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-center">
                <Link
                  href="/app/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-100 hover:underline font-medium"
                >
                  Manage all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-metallic text-black font-bold text-xs flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
