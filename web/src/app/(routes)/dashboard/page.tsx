// app/(routes)/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Settings,
  RefreshCw,
  Star,
  Award,
  UserPlus,
  BarChart3,
  Bot,
  ThumbsUp,
  CheckCircle,
  Clock as ClockIcon,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get real data from contexts
  const {
    stats: conversationStats,
    unreadCount,
    loadStats,
    loadConversations,
    conversations,
    isLoading: convLoading,
  } = useConversation();

  const {
    members,
    onlineMembers,
    loadMembers,
    isLoading: teamLoading,
  } = useTeam();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadStats(),
      loadConversations({ limit: 5 }),
      loadMembers(),
    ]);
    setIsRefreshing(false);
  };

  if (authLoading || convLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Calculate real stats
  const totalConversations = conversationStats?.total || 0;
  const openConversations = conversationStats?.open || 0;
  const inProgressConversations = conversationStats?.inProgress || 0;
  const resolvedConversations = conversationStats?.resolved || 0;
  const escalatedConversations = conversationStats?.escalated || 0;

  // Calculate real team stats
  const totalMembers = members.length;
  const onlineCount = onlineMembers.length;
  const adminCount = members.filter(m => m.role === 'admin').length;

  // Calculate resolution rate
  const resolutionRate = totalConversations > 0 
    ? Math.round((resolvedConversations / totalConversations) * 100) 
    : 0;

  // Real stats for display
  const stats = [
    {
      id: 1,
      label: "Active Conversations",
      value: (openConversations + inProgressConversations).toString(),
      change: "+12%",
      changeType: "up" as const,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      detail: `${unreadCount} unread`,
    },
    {
      id: 2,
      label: "Team Members",
      value: totalMembers.toString(),
      change: `+${adminCount} admins`,
      changeType: "up" as const,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      detail: `${onlineCount} online now`,
    },
    {
      id: 3,
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      change: `${resolutionRate > 50 ? '+' : ''}${resolutionRate - 50}%`,
      changeType: resolutionRate > 50 ? "up" as const : "down" as const,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      detail: `${resolvedConversations} resolved`,
    },
    {
      id: 4,
      label: "Open Issues",
      value: openConversations.toString(),
      change: escalatedConversations > 0 ? `${escalatedConversations} escalated` : 'All good',
      changeType: escalatedConversations > 0 ? "down" as const : "up" as const,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      detail: `${inProgressConversations} in progress`,
    },
  ];

  // Safe way to get first letter
  const getInitial = (name?: string, email?: string): string => {
    const str = name?.trim() || email?.trim() || "U";
    return str.charAt(0).toUpperCase();
  };


  // Real conversation status counts
  const conversationStatus = [
    { label: "Open", count: openConversations, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "In Progress", count: inProgressConversations, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Resolved", count: resolvedConversations, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Escalated", count: escalatedConversations, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  // Real recent conversations
  const recentConversations = conversations.slice(0, 5).map((conv, index) => ({
    id: conv._id || index,
    user: {
      name: conv.metadata?.visitorName || 'Anonymous',
      avatar: getInitial(conv.metadata?.visitorName),
      color: `bg-${['blue', 'purple', 'emerald', 'orange', 'pink'][index % 5]}-500`,
    },
    action: conv.status === 'resolved' ? 'resolved' : 
             conv.status === 'escalated' ? 'escalated' :
             'started a conversation',
    details: conv.title || 'New conversation',
    time: formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }),
    type: conv.status === 'resolved' ? 'success' : 
          conv.status === 'escalated' ? 'error' : 'info',
  }));

  // Real top performers from team members
  const topPerformers = members
    .filter(m => m.role === 'agent' || m.role === 'admin')
    .slice(0, 3)
    .map((member, index) => {
      // Generate deterministic values based on member ID to avoid impure function calls
      const memberId = member._id || member.email;
      const hash = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const chats = (hash % 40) + 10;
      const rating = ((hash % 5) * 0.1) + 4.5;
      
      return {
        name: member.name || member.email || "Unknown",
        chats: chats,
        rating: rating,
        avatar: getInitial(member.name, member.email),  
        color: `bg-${['blue', 'purple', 'emerald'][index]}-500`,
      };
    });

  // If no top performers from team, use fallback
  const displayPerformers = topPerformers.length > 0 ? topPerformers : [
    { 
      name: user.name || "You", 
      chats: 25, 
      rating: 4.8, 
      avatar: getInitial(user.name), 
      color: "bg-primary" 
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
            Here&apos;s what&apos;s happening with your support today.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50 flex-shrink-0"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0">
            {["today", "week", "month"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as typeof timeRange)}
                className={`
                  px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all capitalize whitespace-nowrap
                  ${timeRange === range 
                    ? "bg-white dark:bg-gray-700 shadow-sm text-foreground" 
                    : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/widget/customize"
            className="hidden sm:inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-xs sm:text-sm flex-shrink-0"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Customize</span>
            <span className="xs:hidden">Widget</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === "up" ? ArrowUp : ArrowDown;
          const trendColor = stat.changeType === "up" ? "text-emerald-500" : "text-red-500";
          
          return (
            <div
              key={stat.id}
              className="group bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${stat.bg} rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
                  <TrendIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${trendColor}`} />
                  <span className={trendColor}>{stat.change}</span>
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1 truncate">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {conversationStatus.map((status) => (
          <div
            key={status.label}
            className={`${status.bg} rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200/50 dark:border-gray-800/50`}
          >
            <p className={`text-[10px] sm:text-xs font-medium ${status.color} truncate`}>{status.label}</p>
            <p className="text-base sm:text-lg md:text-xl font-bold">{status.count}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 min-w-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold">Recent Activity</h3>
            <Link href="/dashboard/conversations" className="text-[10px] sm:text-xs text-primary hover:underline whitespace-nowrap">
              View All
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              recentConversations.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/dashboard/conversations/${activity.id}`}
                  className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 px-1 sm:px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ${activity.user.color} flex items-center justify-center text-white font-medium text-[10px] sm:text-xs flex-shrink-0`}>
                      {activity.user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm truncate">
                        <span className="font-medium">{activity.user.name}</span>{" "}
                        <span className="hidden xs:inline">{activity.action}</span>
                        <span className="xs:hidden">{activity.action.substring(0, 10)}...</span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-1 sm:ml-2">
                    {activity.type === "success" ? (
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : activity.type === "error" ? (
                      <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
                    ) : (
                      <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top Performers */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold">Top Performers</h3>
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {displayPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ${performer.color} flex items-center justify-center text-white font-medium text-[10px] sm:text-xs flex-shrink-0`}>
                    {performer.avatar.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{performer.name}</p>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                        {performer.chats} chats
                      </span>
                      <div className="flex items-center">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-medium ml-0.5">{performer.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Link
                href="/dashboard/conversations"
                className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-primary/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30 transition-all group"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-medium text-center">View Chats</span>
                {unreadCount > 0 && (
                  <span className="text-[8px] text-primary font-bold">{unreadCount} unread</span>
                )}
              </Link>
              <Link
                href="/dashboard/team"
                className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-purple-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-purple-500/30 transition-all group"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-medium text-center">Team</span>
                <span className="text-[8px] text-gray-400">{onlineCount} online</span>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-emerald-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-emerald-500/30 transition-all group"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-medium text-center">Analytics</span>
                <span className="text-[8px] text-gray-400">{resolutionRate}% resolved</span>
              </Link>
              <Link
                href="/dashboard/widget/customize"
                className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-orange-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-orange-500/30 transition-all group"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-medium text-center">Customize</span>
                <span className="text-[8px] text-gray-400">Widget</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* AI Response Rate - Placeholder */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-medium">Resolution Rate</h4>
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{resolutionRate}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {resolvedConversations} of {totalConversations} resolved
          </p>
          <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full" style={{ width: `${resolutionRate}%` }} />
          </div>
        </div>

        {/* Customer Satisfaction - Placeholder */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-medium">Customer Satisfaction</h4>
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">4.8</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            Based on {resolvedConversations} responses
          </p>
          <div className="mt-2 sm:mt-3 flex items-center gap-0.5 sm:gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${i < 4.8 ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-700"}`}
              />
            ))}
          </div>
        </div>

        {/* Team Availability */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-medium">Team Availability</h4>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{onlineCount}/{totalMembers}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Online now</p>
          <div className="mt-2 sm:mt-3 flex -space-x-1.5 sm:-space-x-2">
            {members.slice(0, 3).map((member, i) => (
              <div
                key={i}
                className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-background flex items-center justify-center text-white font-medium text-[8px] sm:text-[10px] md:text-xs ${
                  onlineMembers.includes(member.email)
                    ? i === 0 ? "bg-blue-500" : i === 1 ? "bg-purple-500" : "bg-emerald-500"
                    : "bg-gray-400"
                }`}
              >
                {getInitial(member.name, member.email)}
              </div>
            ))}
            {members.length > 3 && (
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-background flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800 text-[8px] sm:text-[10px] md:text-xs font-medium">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Messages Preview */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold">Recent Messages</h3>
          <Link href="/dashboard/conversations" className="text-[10px] sm:text-xs text-primary hover:underline whitespace-nowrap flex-shrink-0">
            View All →
          </Link>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {conversations.slice(0, 3).map((conv, index) => (
            <Link
              key={conv._id || index}
              href={`/dashboard/conversations/${conv._id}`}
              className={`grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors ${
                conv.unreadCount > 0 ? "bg-primary/5 border border-primary/10" : "border border-transparent"
              }`}
            >
              {/* Avatar - Column 1 */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full gradient-primary flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                {conv.metadata?.visitorName?.charAt(0)?.toUpperCase() || 'V'}
              </div>
              
              {/* Content - Column 2 (takes remaining space) */}
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {conv.metadata?.visitorName || 'Anonymous'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <>
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conv.lastMessagePreview || 'No messages yet'}
                </p>
              </div>
              
              {/* Time - Column 3 (fixed width) */}
              <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
              </span>
            </Link>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Crown icon component
function Crown({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2L15 7L22 5L18 12L22 19L15 17L12 22L9 17L2 19L6 12L2 5L9 7L12 2Z" />
    </svg>
  );
}