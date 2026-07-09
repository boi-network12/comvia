// server/src/controllers/companySettingsController.ts

import { Request, Response, NextFunction } from 'express';
import CompanySettings from '../models/CompanySettings';
import { NotFoundError, BadRequestError } from '../utils/errors';

// ============================================================
// GET COMPANY SETTINGS
// ============================================================

// @desc    Get company settings
// @route   GET /api/company/settings
// @access  Private
export const getCompanySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    let settings = await CompanySettings.findOne({ companyId });
    
    if (!settings) {
      // Create default settings
      settings = await CompanySettings.create({
        companyId,
        autoReply: {
          enabled: true,
          mode: 'agent-offline-only',
          cooldownMinutes: 5,
          maxRepliesPerConversation: 3,
          customReplies: [],
          fallbackReply: '👋 Thanks for your message! Our team will get back to you shortly.',
          agentOnlineMessage: '👤 I\'ll connect you with a human agent right away.',
          agentOfflineMessage: '👤 Our team is currently offline. They\'ll get back to you within 24 hours.',
          workingHours: {
            enabled: false,
            timezone: 'UTC',
            hours: { start: '09:00', end: '17:00' },
            days: [1, 2, 3, 4, 5],
          },
        },
        agentDetection: {
          method: 'both',
          inactivityTimeoutMinutes: 5,
          checkIntervalSeconds: 30,
        },
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE COMPANY SETTINGS
// ============================================================

// @desc    Update company settings
// @route   PUT /api/company/settings
// @access  Private
export const updateCompanySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET AUTO-REPLY SETTINGS
// ============================================================

// @desc    Get auto-reply settings
// @route   GET /api/company/settings/auto-reply
// @access  Private
export const getAutoReplySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const settings = await CompanySettings.findOne({ companyId });
    
    if (!settings) {
      throw new NotFoundError('Settings not found');
    }
    
    res.status(200).json({
      success: true,
      data: { autoReply: settings.autoReply },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE AUTO-REPLY SETTINGS
// ============================================================

// @desc    Update auto-reply settings
// @route   PUT /api/company/settings/auto-reply
// @access  Private
export const updateAutoReplySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    const updates = req.body;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: { autoReply: updates, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Auto-reply settings updated successfully',
      data: { autoReply: settings.autoReply },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE AGENT DETECTION SETTINGS
// ============================================================

// @desc    Update agent detection settings
// @route   PUT /api/company/settings/agent-detection
// @access  Private
export const updateAgentDetectionSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    const updates = req.body;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: { agentDetection: updates, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Agent detection settings updated successfully',
      data: { agentDetection: settings.agentDetection },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// RESET AUTO-REPLY TO DEFAULTS
// ============================================================

// @desc    Reset auto-reply to defaults
// @route   POST /api/company/settings/auto-reply/reset
// @access  Private
export const resetAutoReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const defaultSettings = {
      enabled: true,
      mode: 'agent-offline-only' as const,
      cooldownMinutes: 5,
      maxRepliesPerConversation: 3,
      customReplies: [],
      fallbackReply: '👋 Thanks for your message! Our team will get back to you shortly.',
      agentOnlineMessage: '👤 I\'ll connect you with a human agent right away.',
      agentOfflineMessage: '👤 Our team is currently offline. They\'ll get back to you within 24 hours.',
      workingHours: {
        enabled: false,
        timezone: 'UTC',
        hours: { start: '09:00', end: '17:00' },
        days: [1, 2, 3, 4, 5],
      },
    };
    
    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: { autoReply: defaultSettings, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Auto-reply reset to defaults',
      data: { autoReply: settings.autoReply },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TEST REPLY
// ============================================================

// @desc    Test a reply
// @route   POST /api/company/settings/test-reply
// @access  Private
export const testReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const companyId = req.user?.companyId;
    
    if (!message) {
      throw new BadRequestError('Message is required');
    }
    
    const settings = await CompanySettings.findOne({ companyId });
    if (!settings) {
      throw new NotFoundError('Settings not found');
    }
    
    // Import smart reply helper dynamically to avoid circular dependencies
    const { detectIntent, generateReply } = await import('../helper/smartReplyHelper');
    const intents = detectIntent(message);
    const context = {
      companySettings: settings,
      agentOnline: false,
      agentActive: false,
      messageHistory: [],
      conversationId: 'test',
      visitorId: 'test',
      companyId: companyId || '',
      timeSinceLastReply: Infinity,
      messageCount: 1,
      isUrgent: intents.some((i: any) => i.type === 'urgent'),
      isFirstMessage: true,
    };
    const reply = generateReply(intents, context);
    
    res.status(200).json({
      success: true,
      data: {
        reply,
        intent: intents[0]?.type || 'general',
        confidence: intents[0]?.confidence || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ONLINE AGENTS
// ============================================================

// @desc    Get online agents
// @route   GET /api/company/settings/agents/online
// @access  Private
export const getOnlineAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      throw new BadRequestError('Company ID not found');
    }
    
    const settings = await CompanySettings.findOne({ companyId });
    const timeout = settings?.agentDetection?.inactivityTimeoutMinutes || 5;
    
    // Import agent status functions
    const { getAgentStatus, getOnlineAgentsList } = await import('../helper/smartReplyHelper');
    
    const status = getAgentStatus(companyId, timeout);
    const agents = getOnlineAgentsList(companyId);
    
    res.status(200).json({
      success: true,
      data: {
        ...status,
        agents: agents.map((a: any) => ({
          ...a,
          lastActivity: a.lastActivity.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};