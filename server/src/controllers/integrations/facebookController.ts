// server/src/controllers/integrations/facebookController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import axios from 'axios';

// @desc    Connect Facebook
// @route   POST /api/integrations/facebook/connect
// @access  Private
export const connectFacebook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId, accessToken, pageName } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!pageId || !accessToken) {
      throw new BadRequestError('Page ID and access token are required');
    }

    // Verify Facebook access token
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}`,
        {
          params: {
            access_token: accessToken,
            fields: 'name,access_token',
          },
        }
      );

      if (!response.data) {
        throw new Error('Invalid response from Facebook');
      }

      user.integrations.facebook = {
        pageId,
        accessToken,
        enabled: true,
        pageName: pageName || response.data.name,
      };
    } catch (error) {
      throw new BadRequestError('Invalid Facebook access token or page ID');
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Facebook integration connected successfully',
      data: {
        facebook: {
          pageId: user.integrations.facebook.pageId,
          pageName: user.integrations.facebook.pageName,
          enabled: user.integrations.facebook.enabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect Facebook
// @route   DELETE /api/integrations/facebook/disconnect
// @access  Private
export const disconnectFacebook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.integrations.facebook = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Facebook integration disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Facebook integration status
// @route   GET /api/integrations/facebook/status
// @access  Private
export const getFacebookStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        facebook: user.integrations.facebook || { enabled: false },
      },
    });
  } catch (error) {
    next(error);
  }
};