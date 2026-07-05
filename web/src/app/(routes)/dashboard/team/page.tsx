"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Crown,
  Trash2,
  Edit2,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { members, isLoading, loadMembers, inviteMember, updateMember, removeMember, resendInvitation } =
    useTeam();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "agent" as "admin" | "agent",
  });
  const [isInviting, setIsInviting] = useState(false);


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await inviteMember(inviteData);
      setShowInviteModal(false);
      setInviteData({ name: "", email: "", role: "agent" });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "text-purple-500 bg-purple-500/10",
      agent: "text-blue-500 bg-blue-500/10",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          colors[role as keyof typeof colors] || colors.agent
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-bold">{members.length}</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-purple-500">
            {members.filter((m) => m.role === "admin").length}
          </p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
          <p className="text-2xl font-bold text-blue-500">
            {members.filter((m) => m.role === "agent").length}
          </p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          <p className="text-2xl font-bold text-emerald-500">
            {members.filter((m) => m.isOnline).length}
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Invite your first team member to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                      {member.name?.charAt(0) || member.email.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                        member.isOnline ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.name || member.email}</p>
                      {member.email === user?.email && (
                        <span className="text-xs text-gray-400">(You)</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{member.email}</span>
                      {getRoleBadge(member.role)}
                      {member.isOnline && (
                        <span className="text-xs text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Online
                        </span>
                      )}
                      {member.invitedAt && !member.acceptedAt && (
                        <span className="text-xs text-amber-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  {member.email !== user?.email && (
                    <>
                      {!member.acceptedAt && (
                        <button
                          onClick={() => resendInvitation(member.email)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-primary"
                          title="Resend invitation"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMember(member.email, { role: e.target.value as "admin" | "agent" })
                        }
                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="member"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                      </select>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.name || member.email} from team?`)) {
                            removeMember(member.email);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600 dark:text-red-400"
                        aria-label="ag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {member.email === user?.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Crown className="w-4 h-4 text-amber-500" />
                      Owner
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, role: e.target.value as "admin" | "agent" })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="role btn"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}