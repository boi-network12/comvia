"use client";

import { useState, useEffect, useCallback } from "react";
import { useConversation } from "@/contexts/ConversationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Mail,
  Phone,
  Star,
  Tag,
  Users,
  Bot,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRealtimeContext } from "@/contexts";

type ConversationStatus = "open" | "in-progress" | "resolved" | "escalated" | "closed";

const statusColors = {
  open: "text-blue-500 bg-blue-500/10",
  "in-progress": "text-amber-500 bg-amber-500/10",
  resolved: "text-emerald-500 bg-emerald-500/10",
  escalated: "text-red-500 bg-red-500/10",
  closed: "text-gray-500 bg-gray-500/10",
};

const priorityColors = {
  low: "text-gray-500 bg-gray-500/10",
  medium: "text-blue-500 bg-blue-500/10",
  high: "text-orange-500 bg-orange-500/10",
  urgent: "text-red-500 bg-red-500/10",
};

export default function ConversationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { messages: realtimeMessages, visitorMessages } = useRealtimeContext();
  const {
    conversations,
    isLoading,
    loadConversations,
    loadMoreConversations,
    stats,
    pagination,
    isFetchingMore,
    unreadCount,
  } = useConversation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

   useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  useEffect(() => {
  if (visitorMessages.length > 0) {
    // console.log('🔄 [WEB] New visitor message, refreshing conversations...');
    loadConversations({ 
      search: search.trim() || undefined, 
      status: (statusFilter || undefined) as ConversationStatus | undefined
    });
  }
}, [visitorMessages.length]);


  const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  
  loadConversations({ 
    search: search.trim() || undefined, 
    status: (statusFilter || undefined) as ConversationStatus | undefined
  });
};

const handleStatusFilter = useCallback((status: string) => {
    const newStatus = status === statusFilter ? "" : status;
    setStatusFilter(newStatus);
    loadConversations({ 
      search: search.trim() || undefined, 
      status: (newStatus || undefined) as ConversationStatus | undefined
    });
  }, [search, statusFilter, loadConversations]);
  // Filter buttons
  const statusOptions: (ConversationStatus | "")[] = ["", "open", "in-progress", "resolved", "escalated", "closed"];


  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || statusColors.open;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const color = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        <Link
          href="/dashboard/conversations/new"
          className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Link>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
            <p className="text-2xl font-bold text-blue-500">{stats.open}</p>
          </div>
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-amber-500">{stats.inProgress}</p>
          </div>
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
            <p className="text-2xl font-bold text-emerald-500">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm"
          >
            Search
          </button>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center gap-2 text-sm"
        >
          <Filter className="w-4 h-4" />
          Filters
          {statusFilter && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !statusFilter
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {["open", "in-progress", "resolved", "escalated", "closed"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Conversations List */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start a new conversation or wait for visitors to reach out.
            </p>
            <Link
              href="/dashboard/conversations/new"
              className="inline-block mt-4 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Start a conversation
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {conversations.map((conversation) => (
              
                <Link
                  key={conversation._id}
                  href={`/dashboard/conversations/${conversation._id}`}
                  className="block hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <div className="p-4 sm:p-6 flex gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5">
                      {conversation.metadata?.visitorName?.charAt(0) || "V"}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left side content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">
                              {conversation.title || "New Conversation"}
                            </h3>
                          </div>

                          {/* Status + Priority + Unread */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {getStatusBadge(conversation.status)}
                            {conversation.priority && getPriorityBadge(conversation.priority)}
                            {conversation.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                                {conversation.unreadCount} new
                              </span>
                            )}
                          </div>

                          {/* Preview */}
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                            {conversation.lastMessagePreview || "No messages yet"}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                            {conversation.metadata?.visitorName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {conversation.metadata.visitorName}
                              </span>
                            )}
                            {conversation.assignedToName && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {conversation.assignedToName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Right side - Channel + Chevron */}
                        <div className="flex flex-row items-end justify-between h-full py-0.5 flex-shrink-0 gap-2">
                          {conversation.channel && (
                            <div className="text-gray-400">
                              {conversation.channel === "email" && <Mail className="w-4 h-4" />}
                              {conversation.channel === "widget" && <MessageSquare className="w-4 h-4" />}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400 mt-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {pagination.pages > 1 && pagination.page < pagination.pages && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={loadMoreConversations}
                  disabled={isFetchingMore}
                  className="w-full py-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {isFetchingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    `Load more (${pagination.total - pagination.page * pagination.limit} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}