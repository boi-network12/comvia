// app/(routes)/dashboard/team/page.tsx
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
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    members, 
    isLoading, 
    loadMembers, 
    inviteMember, 
    updateMember, 
    removeMember, 
    resendInvitation,
    getOnlineStatus 
  } = useTeam();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "agent" as "admin" | "agent",
  });
  const [isInviting, setIsInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "agent">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "online">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadMembers(), getOnlineStatus()]);
    setIsRefreshing(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await inviteMember(inviteData);
      setShowInviteModal(false);
      setInviteData({ name: "", email: "", role: "agent" });
      // Refresh members after invite
      await loadMembers();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      agent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[role as keyof typeof colors] || colors.agent}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  type TeamMember = {
    acceptedAt?: string | null;
    invitedAt?: string | null;
    isOnline?: boolean;
    email: string;
    name?: string;
    role: "admin" | "agent";
  };

  const getStatusBadge = (member: TeamMember) => {
    const isOwner = member.email === user?.email;

    if (isOwner) {
        return {
        label: "Online",
        icon: <CheckCircle className="w-3 h-3" />,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        };
    }

    if (member.invitedAt && !member.acceptedAt) {
        return {
        label: "Pending",
        icon: <Clock className="w-3 h-3" />,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        };
    }
    if (member.isOnline) {
      return {
        label: "Online",
        icon: <CheckCircle className="w-3 h-3" />,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    return {
      label: "Offline",
      icon: <XCircle className="w-3 h-3" />,
      color: "text-gray-400 bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    };
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
  const searchLower = searchTerm.toLowerCase().trim();

  const matchesSearch = 
    (member.name?.toLowerCase().includes(searchLower) ?? false) ||
    (member.email?.toLowerCase().includes(searchLower) ?? false);

  const matchesRole = roleFilter === "all" || member.role === roleFilter;

  const matchesStatus = statusFilter === "all" || 
    (statusFilter === "online" && (member.isOnline || member.email === user?.email)) ||
    (statusFilter === "pending" && member.invitedAt && !member.acceptedAt && member.email !== user?.email) ||
    (statusFilter === "active" && member.acceptedAt && !member.isOnline && member.email !== user?.email);

  return matchesSearch && matchesRole && matchesStatus;
});

  // Stats
  const totalMembers = members.length;
  const onlineCount = members.filter(m => m.isOnline || m.email === user?.email).length;
  const pendingCount = members.filter(m => m.invitedAt && !m.acceptedAt && m.email !== user?.email).length;
  const adminCount = members.filter(m => m.role === "admin").length;

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50"
            aria-label="Refresh team list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 hover:border-primary/20 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-bold">{totalMembers}</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 hover:border-primary/20 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          <p className="text-2xl font-bold text-emerald-500">{onlineCount}</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 hover:border-primary/20 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 hover:border-primary/20 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-purple-500">{adminCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            aria-label="filter"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            aria-label="junk"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {members.length === 0 
                ? "Invite your first team member to get started." 
                : "Try adjusting your search or filters."}
            </p>
            {members.length === 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-block mt-4 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invite Member
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredMembers.map((member) => {
              const status = getStatusBadge(member);
              const isOwner = member.email === user?.email;
              const isPending = member.invitedAt && !member.acceptedAt && !isOwner;

              return (
                <div
                  key={member.email}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/20">
                        {member.name?.charAt(0) || member.email.charAt(0)}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          member.isOnline ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">
                          {member.name || member.email}
                        </p>
                        {isOwner && (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{member.email}</span>
                        {getRoleBadge(member.role)}
                        <span className={`flex items-center gap-1 text-xs ${status.color} px-2 py-0.5 rounded-full border`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    {isPending && !isOwner && (
                      <button
                        onClick={() => resendInvitation(member.email)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-primary hover:text-primary/80"
                        title="Resend invitation"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {!isOwner && !isPending && (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMember(member.email, { role: e.target.value as "admin" | "agent" })
                        }
                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="Change role"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                      </select>
                    )}
                    {!isOwner && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
                            removeMember(member.email);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isOwner && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Shield className="w-4 h-4 text-purple-500" />
                        Full access
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, role: e.target.value as "admin" | "agent" })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="data"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Admins can manage team members and settings. Agents can only handle conversations.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 px-4 py-2.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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