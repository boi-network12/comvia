// server/src/controllers/integrations/zapierController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import axios from 'axios';

// @desc    Connect Zapier
// @route   POST /api/integrations/zapier/connect
// @access  Private
export const connectZapier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookUrl, triggers } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!webhookUrl) {
      throw new BadRequestError('Webhook URL is required');
    }

    // Test the webhook
    try {
      await axios.post(webhookUrl, {
        test: true,
        message: 'Comvia Zapier integration test',
      });
    } catch (error) {
      throw new BadRequestError('Failed to test Zapier webhook. Please check your URL.');
    }

    user.integrations.zapier = {
      webhookUrl,
      enabled: true,
      triggers: triggers || ['newMessage'],
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Zapier integration connected successfully',
      data: {
        zapier: {
          webhookUrl: user.integrations.zapier.webhookUrl,
          triggers: user.integrations.zapier.triggers,
          enabled: user.integrations.zapier.enabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect Zapier
// @route   DELETE /api/integrations/zapier/disconnect
// @access  Private
export const disconnectZapier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.integrations.zapier = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Zapier integration disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Zapier integration status
// @route   GET /api/integrations/zapier/status
// @access  Private
export const getZapierStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        zapier: user.integrations.zapier || { enabled: false },
      },
    });
  } catch (error) {
    next(error);
  }
};