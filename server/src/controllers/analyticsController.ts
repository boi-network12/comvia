import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import User from '../models/User';
import { logger } from '../utils/logger';

// @desc    Get analytics overview
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { period = 'week' } = req.query;

    const dateFilter = getDateFilter(period as string);

    // Get all conversations for the user
    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: dateFilter },
    });

    // Calculate metrics
    const total = conversations.length;
    const resolved = conversations.filter(c => c.status === 'resolved').length;
    const open = conversations.filter(c => c.status === 'open' || c.status === 'in-progress').length;
    const escalated = conversations.filter(c => c.status === 'escalated').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Average response time (simulated)
    const avgResponseTime = 2.4;

    // Satisfaction rating
    const rated = conversations.filter(c => c.rating);
    const avgRating = rated.length > 0
      ? rated.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length
      : 0;

    // Time series data for charts
    const timeSeriesData = getTimeSeriesData(conversations, period as string);

    // Team performance
    const teamPerformance = await getTeamPerformance(userId);

    // Channel distribution
    const channelDistribution = conversations.reduce((acc, c) => {
      const channel = c.channel || 'widget';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total,
          resolved,
          open,
          escalated,
          resolutionRate,
          avgResponseTime,
          avgRating: Number(avgRating.toFixed(1)),
        },
        timeSeries: timeSeriesData,
        teamPerformance,
        channelDistribution,
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation metrics
// @route   GET /api/analytics/conversations
// @access  Private
export const getConversationMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { period = 'week' } = req.query;

    const dateFilter = getDateFilter(period as string);

    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: dateFilter },
    });

    // Daily breakdown
    const daily = conversations.reduce((acc, c) => {
      const date = c.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { open: 0, resolved: 0, escalated: 0 };
      }
      if (c.status === 'resolved') acc[date].resolved++;
      else if (c.status === 'escalated') acc[date].escalated++;
      else acc[date].open++;
      return acc;
    }, {} as Record<string, { open: number; resolved: number; escalated: number }>);

    const dailyData = Object.keys(daily).map((date) => ({
      date,
      ...daily[date],
    }));

    res.status(200).json({
      success: true,
      data: dailyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team performance
// @route   GET /api/analytics/team
// @access  Private
export const getTeamPerformanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { period = 'week' } = req.query;

    const performance = await getTeamPerformance(userId, period as string);

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function getDateFilter(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
}

function getTimeSeriesData(conversations: any[], period: string) {
  const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayConversations = conversations.filter(c =>
      c.createdAt.toISOString().split('T')[0] === dateStr
    );

    data.push({
      date: dateStr,
      conversations: dayConversations.length,
      resolved: dayConversations.filter(c => c.status === 'resolved').length,
    });
  }

  return data;
}

async function getTeamPerformance(userId: string, period: string = 'week') {
  const user = await User.findById(userId).select('teamMembers');
  if (!user) return [];

  const dateFilter = getDateFilter(period);

  return await Promise.all(
    user.teamMembers.map(async (member) => {
      const conversations = await Conversation.find({
        userId,
        assignedTo: member.email,
        createdAt: { $gte: dateFilter },
      });

      const resolved = conversations.filter(c => c.status === 'resolved');
      const avgRating = conversations
        .filter(c => c.rating)
        .reduce((sum, c) => sum + (c.rating || 0), 0) / (conversations.filter(c => c.rating).length || 1);

      return {
        name: member.email,
        role: member.role,
        conversations: conversations.length,
        resolved: resolved.length,
        rating: Number(avgRating.toFixed(1)),
      };
    })
  );
}