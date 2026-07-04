// app/(routes)/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
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
  Search,
  Filter,
  Plus,
  MoreVertical,
  Star,
  StarHalf,
  UserCheck,
  UserPlus,
  Zap,
  Shield,
  Award,
  Calendar,
  Mail,
  Phone,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Activity,
  BarChart,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  LifeBuoy,
  Bell,
  Circle,
  GitBranch,
  Globe,
  Server,
  Database,
  Cpu,
  Cloud,
  Lock,
  ShieldCheck,
  Sparkles,
  Bot,
  Headphones,
  Briefcase,
  CalendarDays,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  UserCircle,
  Check,
  X,
  Menu,
  PlusCircle,
  Search as SearchIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  // Mock data for the dashboard
  const stats = [
    {
      id: 1,
      label: "Active Conversations",
      value: "24",
      change: "+12%",
      changeType: "up",
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      detail: "8 new today",
    },
    {
      id: 2,
      label: "Team Members",
      value: "6",
      change: "+2",
      changeType: "up",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      detail: "3 online now",
    },
    {
      id: 3,
      label: "Avg. Response Time",
      value: "2.4s",
      change: "-8%",
      changeType: "up",
      icon: Clock,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      detail: "Faster than last week",
    },
    {
      id: 4,
      label: "Satisfaction Rate",
      value: "94%",
      change: "+3%",
      changeType: "up",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      detail: "Based on 156 ratings",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: { name: "Sarah Johnson", avatar: "SJ", color: "bg-blue-500" },
      action: "resolved a ticket",
      details: "Payment issue #1234",
      time: "2 min ago",
      type: "success",
    },
    {
      id: 2,
      user: { name: "Mike Chen", avatar: "MC", color: "bg-purple-500" },
      action: "started a new chat",
      details: "Customer inquiry about pricing",
      time: "15 min ago",
      type: "info",
    },
    {
      id: 3,
      user: { name: "Emily Rodriguez", avatar: "ER", color: "bg-emerald-500" },
      action: "replied to a customer",
      details: "Technical support request",
      time: "1 hour ago",
      type: "success",
    },
    {
      id: 4,
      user: { name: "Alex Kim", avatar: "AK", color: "bg-orange-500" },
      action: "assigned a ticket",
      details: "Feature request #5678",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 5,
      user: { name: "Jessica Lee", avatar: "JL", color: "bg-pink-500" },
      action: "closed a conversation",
      details: "General inquiry resolved",
      time: "3 hours ago",
      type: "success",
    },
  ];

  const topPerformers = [
    { name: "Sarah Johnson", chats: 47, rating: 4.9, avatar: "SJ", color: "bg-blue-500" },
    { name: "Mike Chen", chats: 38, rating: 4.8, avatar: "MC", color: "bg-purple-500" },
    { name: "Emily Rodriguez", chats: 35, rating: 4.7, avatar: "ER", color: "bg-emerald-500" },
  ];

  const conversationStatus = [
    { label: "Open", count: 12, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "In Progress", count: 8, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Resolved", count: 34, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Escalated", count: 2, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your support today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {["today", "week", "month"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as typeof timeRange)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
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
            className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm"
          >
            <Settings className="w-4 h-4" />
            Customize Widget
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === "up" ? ArrowUp : ArrowDown;
          const trendColor = stat.changeType === "up" ? "text-emerald-500" : "text-red-500";
          
          return (
            <div
              key={stat.id}
              className="group bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  <span className={trendColor}>{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {conversationStatus.map((status) => (
          <div
            key={status.label}
            className={`${status.bg} rounded-xl p-3 border border-gray-200/50 dark:border-gray-800/50`}
          >
            <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
            <p className="text-xl font-bold">{status.count}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <button className="text-xs text-primary hover:underline">View All</button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" aria-label="view Alll">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${activity.user.color} flex items-center justify-center text-white font-medium text-xs`}>
                    {activity.user.avatar}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.details}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.type === "success" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Performers */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top Performers</h3>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${performer.color} flex items-center justify-center text-white font-medium text-xs`}>
                    {performer.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{performer.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {performer.chats} chats
                      </span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium ml-0.5">{performer.rating}</span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && <Crown className="w-4 h-4 text-amber-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/conversations/new"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-primary/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30 transition-all group"
              >
                <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">New Chat</span>
              </Link>
              <Link
                href="/dashboard/team/invite"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-purple-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-purple-500/30 transition-all group"
              >
                <UserPlus className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Invite Team</span>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-emerald-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-emerald-500/30 transition-all group"
              >
                <BarChart3 className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Analytics</span>
              </Link>
              <Link
                href="/dashboard/widget/customize"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-orange-500/5 border border-gray-200/50 dark:border-gray-800/50 hover:border-orange-500/30 transition-all group"
              >
                <Settings className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Customize</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">AI Response Rate</h4>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">67%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">+12% from last month</p>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full" style={{ width: "67%" }} />
          </div>
        </div>

        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Customer Satisfaction</h4>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold">94%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Based on 156 responses</p>
          <div className="mt-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < 4.7 ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-700"}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Team Availability</h4>
            <UsersIcon className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">3/6</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online now</p>
          <div className="mt-3 flex -space-x-2">
            {["SJ", "MC", "ER"].map((initials, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white font-medium text-xs ${
                  i === 0 ? "bg-blue-500" : i === 1 ? "bg-purple-500" : "bg-emerald-500"
                }`}
              >
                {initials}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800 text-xs font-medium">
              +3
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages Preview */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Messages</h3>
          <Link href="/dashboard/conversations" className="text-xs text-primary hover:underline">
            View All Conversations →
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { name: "John Doe", message: "I'm having trouble with my payment...", time: "5 min ago", unread: true },
            { name: "Jane Smith", message: "Thanks for your help! Everything works now.", time: "15 min ago", unread: false },
            { name: "Bob Wilson", message: "When will the new features be available?", time: "1 hour ago", unread: true },
          ].map((msg, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors ${
                msg.unread ? "bg-primary/5 border border-primary/10" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                {msg.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{msg.name}</p>
                  {msg.unread && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{msg.message}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{msg.time}</span>
            </div>
          ))}
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