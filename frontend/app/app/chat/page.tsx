"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { channelService } from "@/lib/services/channel.service";
import { messageService } from "@/lib/services/message.service";
import { Channel, Message } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  MessageSquare,
  Plus,
  Hash,
  Send,
  X,
  Loader2,
  Trash2,
  ArrowLeft,
  Info,
  Circle,
} from "lucide-react";

export default function ChatPage() {
  const { currentWorkspace } = useWorkspace();
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Unread message indicators per channelId
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create Channel Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChannels = async () => {
    if (!currentWorkspace) return;
    try {
      setLoadingChannels(true);
      setError(null);
      const res = await channelService.getChannels(currentWorkspace.id);
      const channelList = res.data || [];
      setChannels(channelList);

      if (channelList.length > 0 && !selectedChannel) {
        selectChannel(channelList[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load channels");
    } finally {
      setLoadingChannels(false);
    }
  };

  const selectChannel = async (channel: Channel) => {
    if (selectedChannel && socket) {
      socket.emit("leave-channel", selectedChannel.id);
    }

    setSelectedChannel(channel);
    setShowMobileChat(true);
    setTypingUsers([]);
    setUnreadMap((prev) => ({ ...prev, [channel.id]: false }));

    if (socket) {
      socket.emit("join-channel", channel.id);
    }

    try {
      setLoadingMessages(true);
      const res = await messageService.getMessages(channel.id);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load channel messages");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [currentWorkspace]);

  // Socket.IO event listeners for real-time messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: Message) => {
      if (selectedChannel && newMsg.channelId === selectedChannel.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      } else {
        // Mark unread for other channel
        setUnreadMap((prev) => ({ ...prev, [newMsg.channelId]: true }));
      }
    };

    const handleMessageUpdated = (updatedMsg: Message) => {
      if (selectedChannel && updatedMsg.channelId === selectedChannel.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      }
    };

    const handleMessageDeleted = (data: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    };

    const handleUserTyping = (data: { userId: string; name: string }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.name])));
      }
    };

    const handleUserStopTyping = (data: { userId: string }) => {
      setTypingUsers([]);
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, selectedChannel, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !selectedChannel) return;

    socket.emit("typing", selectedChannel.id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", selectedChannel.id);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel || !inputText.trim()) return;

    const content = inputText.trim();
    setInputText("");

    if (socket) socket.emit("stop-typing", selectedChannel.id);

    try {
      const res = await messageService.createMessage(selectedChannel.id, content);
      if (res.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to send message");
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setCreateError(null);

    const formattedName = channelName.trim().toLowerCase().replace(/\s+/g, "-");
    if (formattedName.length < 3) {
      setCreateError("Channel name must be at least 3 characters");
      return;
    }

    try {
      setCreating(true);
      const res = await channelService.createChannel(currentWorkspace.id, {
        name: formattedName,
        description: channelDesc.trim() || undefined,
      });

      if (res.success && res.data) {
        showToast("success", `Channel #${res.data.name} created!`);
        setChannelName("");
        setChannelDesc("");
        setIsCreateOpen(false);
        await fetchChannels();
        selectChannel(res.data);
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChannel) return;
    try {
      await messageService.deleteMessage(selectedChannel.id, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      showToast("success", "Message deleted");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete message");
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto my-12">
        <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Workspace Selected</h2>
        <p className="text-xs text-slate-400">Please select or create a workspace to access channels.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] max-w-7xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex overflow-hidden shadow-2xl relative">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar Channel List (Responsive Drawer/Column) */}
      <div
        className={`w-full md:w-72 bg-slate-950/60 border-r border-slate-800/80 flex flex-col shrink-0 ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Channels
          </span>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="p-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            title="Create Channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {loadingChannels ? (
            <div className="py-12 text-center">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-xs text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
              {error}
            </div>
          ) : channels.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs space-y-2">
              <p>No channels in this workspace.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Create first channel
              </button>
            </div>
          ) : (
            channels.map((c) => {
              const isSelected = selectedChannel?.id === c.id;
              const hasUnread = unreadMap[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => selectChannel(c)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Hash className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-slate-500"}`} />
                    <span className="truncate">{c.name}</span>
                  </div>

                  {hasUnread && !isSelected && (
                    <Circle className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Stream Area */}
      <div
        className={`flex-1 flex flex-col bg-slate-900/90 ${
          !showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedChannel ? (
          <>
            {/* Topbar Header */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>#{selectedChannel.name}</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                    {selectedChannel.description || "General channel discussion"}
                  </p>
                </div>
              </div>

              {/* Socket Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  {connected ? "Real-time Live" : "Connecting Socket..."}
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                </div>
              ) : messages.length === 0 ? (
                /* Empty Channel State */
                <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
                    <Hash className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Welcome to #{selectedChannel.name}!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This is the start of the #{selectedChannel.name} channel. Post a message to kick off the team conversation.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.createdById === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {m.createdBy?.name ? m.createdBy.name.substring(0, 2).toUpperCase() : "U"}
                      </div>

                      {/* Message Content & Metadata */}
                      <div className={`space-y-1 max-w-[75%] sm:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                            isMe ? "justify-end" : ""
                          }`}
                        >
                          <span className="font-bold text-slate-200">{m.createdBy?.name || "Member"}</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && (
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity ml-1"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed inline-block break-words ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20"
                              : "bg-slate-950/80 border border-slate-800/80 text-slate-200 rounded-tl-xs shadow-sm"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="text-[11px] text-indigo-400 italic flex items-center gap-2 pt-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>
                    {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Send a message in #${selectedChannel.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-500">
            <Info className="w-10 h-10 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-300">No Channel Selected</h3>
            <p className="text-xs text-slate-500">Select a channel from the left sidebar to start chatting with your team.</p>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Create New Channel</h2>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Channel Name *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. backend-updates"
                    required
                    minLength={3}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  placeholder="Channel topic or purpose..."
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                />
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
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Channel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
