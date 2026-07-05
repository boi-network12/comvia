// app/(routes)/dashboard/analytics/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Calendar,
  Bot,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    data,
    isLoading,
    isRefreshing,
    period,
    setPeriod,
    refreshAnalytics,
    exportData,
    totalConversations,
    resolutionRate,
    avgResponseTime,
    avgRating,
    channelDistribution,
    teamPerformance
  } = useAnalytics();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your support performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            { ["today", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as "today" | "week" | "month")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  period === p
                    ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
                    : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={refreshAnalytics}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50"
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportData}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            aria-label="Export data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-1">{totalConversations}</p>
          <p className="text-xs text-gray-400">Conversations</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Resolution Rate</p>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{resolutionRate}%</p>
          <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Response</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{avgResponseTime}s</p>
          <p className="text-xs text-gray-400">Response time</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Satisfaction</p>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{avgRating}</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300 dark:text-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Channel Distribution</h3>
          <div className="space-y-3">
            {Object.entries(channelDistribution).map(([channel, count]) => {
              const total = Object.values(channelDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = {
                widget: "bg-primary",
                email: "bg-blue-500",
                facebook: "bg-blue-600",
                instagram: "bg-purple-500",
                twitter: "bg-cyan-500",
                api: "bg-emerald-500",
              };
              return (
                <div key={channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{channel}</span>
                    <span>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[channel] || "bg-gray-500"} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
              <p className="text-xl font-bold text-blue-500">{data.overview.open}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-amber-500">{data.overview.open}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="text-xl font-bold text-emerald-500">{data.overview.resolved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escalated</p>
              <p className="text-xl font-bold text-red-500">{data.overview.escalated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      {teamPerformance && teamPerformance.length > 0 && (
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Team Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 font-medium">Member</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium text-right">Conversations</th>
                  <th className="pb-2 font-medium text-right">Resolved</th>
                  <th className="pb-2 font-medium text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {teamPerformance.map((member, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-3 font-medium">{member.name}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 capitalize">
                      {member.role}
                    </td>
                    <td className="py-3 text-right">{member.conversations}</td>
                    <td className="py-3 text-right">
                      {member.resolved} ({Math.round((member.resolved / member.conversations) * 100)}%)
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {member.rating}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Conversation Trend</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.timeSeries.map((item, index) => {
            const max = Math.max(...data.timeSeries.map((d) => d.conversations), 1);
            const height = max > 0 ? (item.conversations / max) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 hover:bg-primary/30 rounded-t transition-all"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${(item.resolved / Math.max(item.conversations, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 rotate-45 sm:rotate-0">
                  {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 rounded" />
            <span className="text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span className="text-gray-500 dark:text-gray-400">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}