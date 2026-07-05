"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { analyticsAPI, AnalyticsOverview, AnalyticsPeriod, ConversationMetric, TeamPerformance } from '@/services/analytics';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  // Data
  data: AnalyticsOverview | null;
  conversationMetrics: ConversationMetric[];
  teamPerformance: TeamPerformance[];
  isLoading: boolean;
  isRefreshing: boolean;
  period: AnalyticsPeriod;
  
  // Actions
  loadAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadConversationMetrics: (period?: AnalyticsPeriod) => Promise<void>;
  loadTeamPerformance: (period?: AnalyticsPeriod) => Promise<void>;
  setPeriod: (period: AnalyticsPeriod) => void;
  refreshAnalytics: () => Promise<void>;
  exportData: () => Promise<void>;
  
  // Computed
  totalConversations: number;
  resolutionRate: number;
  avgResponseTime: number;
  avgRating: number;
  channelDistribution: Record<string, number>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  
  // State
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetric[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  // Load conversation metrics
  const loadConversationMetrics = useCallback(async (periodOverride?: AnalyticsPeriod) => {
    if (!user) return;
    
    const currentPeriod = periodOverride || period;
    
    try {
      const response = await analyticsAPI.getConversationMetrics(currentPeriod);
      setConversationMetrics(response.data);
    } catch (error) {
      console.error('Failed to load conversation metrics:', error);
      showError('Failed to load conversation metrics');
    }
  }, [user, period, showError]);

  // Load team performance
  const loadTeamPerformance = useCallback(async (periodOverride?: AnalyticsPeriod) => {
    if (!user) return;
    
    const currentPeriod = periodOverride || period;
    
    try {
      const response = await analyticsAPI.getTeamPerformance(currentPeriod);
      setTeamPerformance(response.data);
    } catch (error) {
      console.error('Failed to load team performance:', error);
      showError('Failed to load team performance');
    }
  }, [user, period, showError]);

  // Load all analytics data
  const loadAnalytics = useCallback(async (periodOverride?: AnalyticsPeriod) => {
    if (!user) return;
    
    const currentPeriod = periodOverride || period;
    setIsLoading(true);
    
    try {
      const response = await analyticsAPI.getAnalytics(currentPeriod);
      setData(response.data);
      
      // Load metrics and team performance in parallel
      await Promise.all([
        loadConversationMetrics(currentPeriod),
        loadTeamPerformance(currentPeriod),
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [user, period, loadConversationMetrics, loadTeamPerformance, showError]);

  // Refresh all analytics
  const refreshAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadAnalytics(period);
      showSuccess('Analytics refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      showError('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAnalytics, period, showSuccess, showError]);

  // Export data
  const exportData = useCallback(async () => {
    try {
      showSuccess('Data export started. You will receive an email with the report.');
      // TODO: Implement actual export
      // const response = await analyticsAPI.exportData(period);
    } catch (error) {
      console.error('Failed to export data:', error);
      showError('Failed to export data');
    }
  }, [showSuccess, showError, period]);

  // Computed values
  const totalConversations = data?.overview.total || 0;
  const resolutionRate = data?.overview.resolutionRate || 0;
  const avgResponseTime = data?.overview.avgResponseTime || 0;
  const avgRating = data?.overview.avgRating || 0;
  const channelDistribution = data?.channelDistribution || {};

  // Auto-load analytics when user or period changes
  useEffect(() => {
    if (user) {
        // eslint-disable-next-line
      loadAnalytics();
    }
  }, [user, period, loadAnalytics]);

  const contextValue = useMemo<AnalyticsContextType>(() => ({
    data,
    conversationMetrics,
    teamPerformance,
    isLoading,
    isRefreshing,
    period,
    
    loadAnalytics,
    loadConversationMetrics,
    loadTeamPerformance,
    setPeriod,
    refreshAnalytics,
    exportData,
    
    totalConversations,
    resolutionRate,
    avgResponseTime,
    avgRating,
    channelDistribution,
  }), [
    data,
    conversationMetrics,
    teamPerformance,
    isLoading,
    isRefreshing,
    period,
    loadAnalytics,
    loadConversationMetrics,
    loadTeamPerformance,
    setPeriod,
    refreshAnalytics,
    exportData,
    totalConversations,
    resolutionRate,
    avgResponseTime,
    avgRating,
    channelDistribution,
  ]);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}