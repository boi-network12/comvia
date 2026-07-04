// server/src/controllers/integrations/slackController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import axios from 'axios';

// @desc    Connect Slack
// @route   POST /api/integrations/slack/connect
// @access  Private
export const connectSlack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookUrl, channel } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate webhook URL
    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
      throw new BadRequestError('Invalid Slack webhook URL');
    }

    // Test the webhook
    try {
      await axios.post(webhookUrl, {
        text: '✅ Comvia integration connected successfully!',
      });
    } catch (error) {
      throw new BadRequestError('Failed to send test message to Slack. Please check your webhook URL.');
    }

    user.integrations.slack = {
      webhookUrl,
      channel: channel || '#general',
      enabled: true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Slack integration connected successfully',
      data: {
        slack: {
          channel: user.integrations.slack.channel,
          enabled: user.integrations.slack.enabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect Slack
// @route   DELETE /api/integrations/slack/disconnect
// @access  Private
export const disconnectSlack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.integrations.slack = {
      webhookUrl: '',
      channel: '',
      enabled: false,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Slack integration disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Slack integration status
// @route   GET /api/integrations/slack/status
// @access  Private
export const getSlackStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        slack: user.integrations.slack || { enabled: false },
      },
    });
  } catch (error) {
    next(error);
  }
};