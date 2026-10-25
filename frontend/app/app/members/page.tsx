"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useEffect, useEffectEvent, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import { workspaceService } from "@/lib/services/workspace.service";
import { Role, WorkspaceMember, WorkspaceInvitation } from "@/lib/types";
import { Users, UserPlus, Trash2, X, Loader2, Mail, Clock } from "lucide-react";

export default function MembersPage() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserRole = members.find(m => m.userId === user?.id)?.role;

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [membersRes, invitesRes, receivedRes] = await Promise.all([
        workspaceService.getMembers(currentWorkspace.id),
        workspaceService.getPendingInvitations(currentWorkspace.id).catch(() => ({ data: [] })),
        workspaceService.getReceivedInvitations().catch(() => ({ data: [] }))
      ]);
      setMembers(membersRes.data || []);
      setInvitations(invitesRes.data || []);
      setReceivedInvitations(receivedRes.data || []);
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = useEffectEvent(() => {
    void fetchMembers();
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshMembers, 0);
    return () => window.clearTimeout(timeoutId);
  }, [currentWorkspace]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !email.trim()) return;

    try {
      setInviting(true);
      setError(null);
      await workspaceService.inviteMember(currentWorkspace.id, {
        email: email.trim(),
        role,
      });
      setEmail("");
      setIsInviteOpen(false);
      await fetchMembers();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to invite member"));
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    if (!currentWorkspace) return;
    try {
      await workspaceService.updateMemberRole(currentWorkspace.id, memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to update member role"));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace) return;
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;

    try {
      await workspaceService.removeMember(currentWorkspace.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to remove member"));
    }
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-zinc-400">Please select a workspace.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            Members & Roles
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage who has access to {currentWorkspace.name}
          </p>
        </div>

        {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-sm font-medium shadow-lg shadow-zinc-400/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="p-6 rounded-2xl bg-[#121212]/90 border border-zinc-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Members ({members.length})
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
            <span className="text-xs text-zinc-400">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">No members found</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {members.map((m) => (
              <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center shrink-0">
                    {m.user?.name ? m.user.name.substring(0, 2).toUpperCase() : "U"}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm text-zinc-100 truncate">{m.user?.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{m.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentUserRole === "OWNER" && m.role !== "OWNER" ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as Role)}
                      className="bg-[#050505] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  ) : (
                    <div className="bg-[#050505] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-400">
                      {m.role}
                    </div>
                  )}

                  {((currentUserRole === "OWNER" && m.role !== "OWNER") || (currentUserRole === "ADMIN" && m.role === "MEMBER")) && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {(invitations.length > 0 || receivedInvitations.length > 0) && (
        <div className="p-6 rounded-2xl bg-[#121212]/90 border border-zinc-800 space-y-8">
          
          {/* Sent Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                For invitations SENT by current user
              </div>
              <div className="divide-y divide-slate-800/80">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center shrink-0">
                        {inv.invitee?.name ? inv.invitee.name.substring(0, 2).toUpperCase() : <Clock className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-sm text-zinc-100 truncate">{inv.invitee?.name || "Pending User"}</div>
                        <div className="text-xs text-zinc-400 truncate">{inv.inviteeEmail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {inv.status}
                      </span>
                      <div className="bg-[#050505] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-400">
                        {inv.role}
                      </div>
                      {user?.id === inv.inviterId && (
                        <button
                          onClick={async () => {
                            if (!confirm("Cancel this invitation?")) return;
                            try {
                              await workspaceService.cancelInvitation(inv.id);
                              await fetchMembers();
                            } catch (err: unknown) {
                              alert(getErrorMessage(err, "Failed to cancel invitation"));
                            }
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-[11px] font-bold rounded-lg transition-colors border border-zinc-700 hover:border-red-500/50"
                        >
                          Cancel / Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Received Invitations */}
          {receivedInvitations.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                For invitations RECEIVED by current user
              </div>
              <div className="divide-y divide-slate-800/80">
                {receivedInvitations.map((inv) => (
                  <div key={inv.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center shrink-0">
                        {inv.inviter?.name ? inv.inviter.name.substring(0, 2).toUpperCase() : <Clock className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-sm text-zinc-100 truncate">{inv.inviter?.name || "Sender"}</div>
                        <div className="text-xs text-zinc-400 truncate">Workspace: {inv.workspace?.name || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {inv.status}
                      </span>
                      <div className="bg-[#050505] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-400">
                        {inv.role}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await workspaceService.acceptInvitation(inv.id);
                            await fetchMembers();
                            // If they accept a workspace they might want it in their selector, it's good to refresh context but let's stick to fetchMembers
                            window.location.reload(); // Hard refresh to ensure workspace selector updates
                          } catch (err: unknown) {
                            alert(getErrorMessage(err, "Failed to accept invitation"));
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await workspaceService.rejectInvitation(inv.id);
                            await fetchMembers();
                          } catch (err: unknown) {
                            alert(getErrorMessage(err, "Failed to reject invitation"));
                          }
                        }}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold text-zinc-100">Invite Team Member</h2>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  User Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-sm font-medium rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
