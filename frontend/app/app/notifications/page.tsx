"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import { notificationService } from "@/lib/services/notification.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { NotificationItem } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import { Bell, Check, Trash2, Loader2, CheckCheck, Clock } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const { fetchWorkspaces } = useWorkspace();

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = useEffectEvent(() => {
    void fetchNotifications();
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshNotifications, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      showToast("success", "Notification marked as read");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to mark as read"));
    }
  };

  const handleAcceptInvite = async (invitationId: string, notificationId: string) => {
    try {
      await workspaceService.acceptInvitation(invitationId);
      await notificationService.markAsRead(notificationId, true);
      showToast("success", "Invitation accepted! Refresh or check the workspace selector.");
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      // Refresh workspaces to immediately show the new one in the UI
      await fetchWorkspaces();
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to accept invitation"));
    }
  };

  const handleRejectInvite = async (invitationId: string, notificationId: string) => {
    try {
      await workspaceService.rejectInvitation(invitationId);
      await notificationService.markAsRead(notificationId, true);
      showToast("success", "Invitation rejected");
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to reject invitation"));
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      setMarkingAll(true);
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id, true)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("success", "All notifications marked as read");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to mark all as read"));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("success", "Notification deleted");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete notification"));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-zinc-400" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Task assignments, updates, mentions, and workspace activities
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-semibold shadow-md shadow-zinc-400/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-[#121212]/90 border border-zinc-800 space-y-4 shadow-xl">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
            <span className="text-xs text-zinc-400">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            You&apos;re all caught up! No notifications available.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  n.isRead
                    ? "bg-[#050505]/40 border-zinc-800/60 text-zinc-400"
                    : "bg-zinc-200/5 border-zinc-500/30 text-zinc-200 shadow-md"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 text-sm">{n.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {n.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{n.message}</p>
                  
                  {n.type === "WORKSPACE_INVITE" && !n.isRead && n.entityId && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptInvite(n.entityId!, n.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvite(n.entityId!, n.id)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-lg border border-zinc-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-500 pt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-200/10 transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
