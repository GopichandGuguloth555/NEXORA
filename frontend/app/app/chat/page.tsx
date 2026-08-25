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
  MoreVertical,
  Search,
  Users,
  Smile,
  Paperclip,
  Calendar,
  Settings,
  Bell,
  Command,
  Reply,
  Edit2,
  MoreHorizontal
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
  
  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = useState(true);

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
      <div className="p-12 text-center bg-[#121212]/70 rounded-2xl border border-zinc-800 space-y-4 max-w-md mx-auto my-12">
        <MessageSquare className="w-10 h-10 text-zinc-500 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-100">No Workspace Selected</h2>
        <p className="text-xs text-zinc-400">Please select or create a workspace to access channels.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] w-full max-w-[1600px] mx-auto rounded-2xl bg-[#050505] border border-zinc-800/60 flex overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] relative mt-2 mb-2 font-sans">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.03),_transparent_50%)]" />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar Channel List (Left Panel) */}
      <div
        className={`relative w-full md:w-64 lg:w-72 bg-[#0a0a0a] border-r border-zinc-800/60 flex flex-col shrink-0 transition-transform duration-300 z-10 ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="h-14 px-4 border-b border-zinc-800/60 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <span className="font-bold text-sm tracking-wide text-zinc-100 flex items-center gap-2">
            NEXORA CHANNELS
          </span>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer"
            title="Create Channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
            <input
              type="text"
              placeholder="Search channels..."
              className="w-full bg-zinc-900/50 border border-zinc-800/80 focus:border-zinc-600 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <span className="text-[10px] text-zinc-500 border border-zinc-700 rounded px-1">⌘</span>
              <span className="text-[10px] text-zinc-500 border border-zinc-700 rounded px-1">K</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
            <span>Channels</span>
          </div>
          
          {loadingChannels ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-3 text-center text-[11px] text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
            </div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-xs space-y-2">
              <p>No channels yet.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="text-zinc-400 hover:text-zinc-200 hover:underline transition-colors"
              >
                Create one
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {channels.map((c) => {
                const isSelected = selectedChannel?.id === c.id;
                const hasUnread = unreadMap[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => selectChannel(c)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between transition-colors group ${
                      isSelected
                        ? "bg-zinc-800/80 text-zinc-100 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Hash className={`w-4 h-4 shrink-0 ${isSelected ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                      <span className="truncate">{c.name}</span>
                    </div>

                    {hasUnread && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Area (Center) */}
      <div
        className={`flex-1 flex flex-col bg-[#050505] min-w-0 relative ${
          !showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedChannel ? (
          <>
            {/* Conversation Header */}
            <div className="h-14 px-4 border-b border-zinc-800/60 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="w-5 h-5 text-zinc-400 shrink-0" />
                  <h2 className="font-semibold text-zinc-100 truncate flex items-center gap-2">
                    {selectedChannel.name}
                    {connected && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    )}
                  </h2>
                </div>
                
                {selectedChannel.description && (
                  <>
                    <div className="w-px h-4 bg-zinc-800 hidden sm:block mx-1" />
                    <p className="text-xs text-zinc-400 truncate hidden sm:block max-w-md">
                      {selectedChannel.description}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors hidden sm:block">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors hidden sm:block">
                  <Users className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className={`p-1.5 rounded-lg transition-colors hidden lg:block ${showInfoPanel ? 'text-zinc-100 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
                >
                  <Info className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar relative">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-start justify-end min-h-[60vh] max-w-2xl pb-10">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-4">
                    <Hash className="w-6 h-6 text-zinc-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-2">Welcome to #{selectedChannel.name}</h3>
                  <p className="text-zinc-400 mb-6">
                    This is the start of the <span className="text-zinc-300 font-medium">#{selectedChannel.name}</span> channel. 
                    {selectedChannel.description ? ` ${selectedChannel.description}` : " Start the conversation with your team."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((m, i) => {
                    const isMe = m.createdById === user?.id;
                    const prevMsg = i > 0 ? messages[i - 1] : null;
                    const isGrouped = prevMsg && prevMsg.createdById === m.createdById && 
                                      (new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 300000); // 5 mins
                    
                    return (
                      <div
                        key={m.id}
                        className={`group flex items-start gap-4 hover:bg-zinc-900/40 -mx-4 px-4 py-1 rounded-lg transition-colors ${isGrouped ? 'mt-1' : 'mt-4'}`}
                      >
                        {/* Avatar (only show if not grouped) */}
                        <div className="shrink-0 w-10 flex justify-center">
                          {!isGrouped ? (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-sm">
                              <span className="text-zinc-200 font-medium text-sm">
                                {m.createdBy?.name ? m.createdBy.name.substring(0, 2).toUpperCase() : "U"}
                              </span>
                            </div>
                          ) : (
                            <div className="w-10 opacity-0 group-hover:opacity-100 text-[10px] text-zinc-500 flex items-center justify-center pt-1">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0 relative">
                          {!isGrouped && (
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-sm text-zinc-200">
                                {m.createdBy?.name || "Member"}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                          <div className="text-[15px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {m.content}
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 -translate-y-3 bg-[#111] border border-zinc-700 rounded-lg shadow-xl flex items-center z-10">
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-l-lg transition-colors" title="Add reaction">
                            <Smile className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors" title="Reply">
                            <Reply className="w-4 h-4" />
                          </button>
                          {isMe && (
                            <>
                              <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMessage(m.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" 
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-r-lg transition-colors" title="More actions">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-3 px-14 py-2 text-xs text-zinc-400">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>
                    <span className="font-medium text-zinc-300">{typingUsers.join(", ")}</span> {typingUsers.length > 1 ? "are" : "is"} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Composer Area */}
            <div className="px-4 pb-6 pt-2 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
              <form 
                onSubmit={handleSendMessage} 
                className="bg-[#121212] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500/50 transition-all shadow-lg"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="w-full bg-transparent px-4 py-3.5 text-[15px] text-zinc-100 placeholder-zinc-500 outline-none"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a]/50 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors" title="Add attachment">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors" title="Add emoji">
                      <Smile className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-zinc-700 mx-1" />
                    <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors text-[10px] font-medium tracking-wide" title="Format text">
                      Aa
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 hidden sm:inline-block">Press Enter to send</span>
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                        inputText.trim() 
                          ? "bg-zinc-200 text-black hover:bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#050505]">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">No Channel Selected</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              Choose a channel from the sidebar to join the conversation or create a new one.
            </p>
          </div>
        )}
      </div>

      {/* Right Info Panel (Collapsible) */}
      {selectedChannel && showInfoPanel && (
        <div className="hidden lg:flex w-72 bg-[#0a0a0a] border-l border-zinc-800/60 flex-col shrink-0">
          <div className="h-14 px-4 border-b border-zinc-800/60 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0">
            <h3 className="font-semibold text-sm text-zinc-100">Details</h3>
            <button 
              onClick={() => setShowInfoPanel(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-3">
                <Hash className="w-8 h-8 text-zinc-300" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">#{selectedChannel.name}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selectedChannel.description || "No description provided for this channel."}
              </p>
            </div>

            <div className="space-y-1 mb-6">
              <button className="w-full flex items-center justify-between p-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors group">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  <span>Members</span>
                </div>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full">1</span>
              </button>
              <button className="w-full flex items-center justify-between p-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors group">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  <span>Created</span>
                </div>
                <span className="text-xs text-zinc-500">Aug 25, 2026</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Actions
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors group">
                  <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  <span>Search in conversation</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors group">
                  <Bell className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors group">
                  <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  <span>Channel settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm anim-fade-in">
          <div className="w-full max-w-md bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 anim-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-zinc-300" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100">Create Channel</h2>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. design-updates"
                    required
                    minLength={3}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-zinc-200 hover:bg-white text-black text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
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
