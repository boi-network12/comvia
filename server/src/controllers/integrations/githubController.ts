// server/src/controllers/integrations/githubController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import axios from 'axios';

// @desc    Connect GitHub
// @route   POST /api/integrations/github/connect
// @access  Private
export const connectGitHub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, repo, owner, syncIssues } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!accessToken || !repo) {
      throw new BadRequestError('Access token and repository are required');
    }

    // Verify GitHub access token
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.data) {
        throw new Error('Invalid response from GitHub');
      }

      // Verify repository access
      const repoCheck = await axios.get(
        `https://api.github.com/repos/${owner || response.data.login}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!repoCheck.data) {
        throw new Error('Repository not found or no access');
      }

      user.integrations.github = {
        accessToken,
        repo,
        owner: owner || response.data.login,
        enabled: true,
        syncIssues: syncIssues !== undefined ? syncIssues : true,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new BadRequestError('Invalid GitHub access token');
      } else if (error.response?.status === 404) {
        throw new BadRequestError('Repository not found or no access');
      }
      throw new BadRequestError('Failed to verify GitHub credentials');
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'GitHub integration connected successfully',
      data: {
        github: {
          repo: user.integrations.github.repo,
          owner: user.integrations.github.owner,
          syncIssues: user.integrations.github.syncIssues,
          enabled: user.integrations.github.enabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect GitHub
// @route   DELETE /api/integrations/github/disconnect
// @access  Private
export const disconnectGitHub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.integrations.github = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'GitHub integration disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GitHub integration status
// @route   GET /api/integrations/github/status
// @access  Private
export const getGitHubStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        github: user.integrations.github || { enabled: false },
      },
    });
  } catch (error) {
    next(error);
  }
};