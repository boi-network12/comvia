// server/src/controllers/integrations/emailController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';

// @desc    Update email notification settings
// @route   PUT /api/integrations/email/update
// @access  Private
export const updateEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled, notifications } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Ensure integrations and email objects exist on the user before updating
    if (!user.integrations) {
      // @ts-ignore - create integrations object if missing
      user.integrations = {} as any;
    }

    if (!user.integrations.email) {
      // initialize with defaults
      user.integrations.email = {
        enabled: true,
        notifications: {
          newMessage: true,
          newTicket: true,
          teamInvite: true,
        },
      } as any;
    }

    // ensure TypeScript knows email exists
    const email = user.integrations.email as any;

    if (enabled !== undefined) {
      email.enabled = enabled;
    }

    if (notifications) {
      email.notifications = {
        newMessage: notifications.newMessage !== undefined ? notifications.newMessage : true,
        newTicket: notifications.newTicket !== undefined ? notifications.newTicket : true,
        teamInvite: notifications.teamInvite !== undefined ? notifications.teamInvite : true,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email settings updated successfully',
      data: {
        email: user.integrations.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get email settings
// @route   GET /api/integrations/email/settings
// @access  Private
export const getEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.integrations.email || {
          enabled: true,
          notifications: {
            newMessage: true,
            newTicket: true,
            teamInvite: true,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};