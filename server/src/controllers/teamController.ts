import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendMail } from '../utils/mailer';
import { emailTemplates } from '../utils/emailTemplates';
import crypto from 'crypto';

// @desc    Get all team members
// @route   GET /api/team
// @access  Private
export const getTeamMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    // Get the user's company team
    const user = await User.findById(userId).select('teamMembers');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get full details for each team member
    const memberEmails = user.teamMembers.map(m => m.email);
    const members = await User.find(
      { email: { $in: memberEmails } },
      'name email avatar role isEmailVerified lastLogin'
    ).lean();

    // Merge with team data
    const teamWithDetails = user.teamMembers.map(teamMember => {
      const memberDetail = members.find(m => m.email === teamMember.email);
      return {
        ...teamMember,
        ...memberDetail,
        isOnline: false, // Will be updated by realtime
      };
    });

    res.status(200).json({
      success: true,
      data: teamWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite team member
// @route   POST /api/team/invite
// @access  Private
export const inviteTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { email, name, role = 'agent' } = req.body;

    if (!email || !name) {
      throw new BadRequestError('Email and name are required');
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already a team member
    const existingMember = user.teamMembers.find(m => m.email === email);
    if (existingMember) {
      throw new BadRequestError('User is already a team member');
    }

    // Add to team
    user.teamMembers.push({
      email,
      role,
      invitedAt: new Date(),
    });

    await user.save();

    // Send invitation email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const inviteToken = crypto.randomBytes(32).toString('hex'); 
      const inviteUrl = `${frontendUrl}/accept-invite?token=${inviteToken}&email=${encodeURIComponent(email)}`;

      await sendMail(
        email,
        emailTemplates.teamInvitation(
          user.name, 
          user.companyName || 'Comvia', 
          inviteUrl
        ).subject,
        emailTemplates.teamInvitation(
          user.name, 
          user.companyName || 'Comvia', 
          inviteUrl
        ).html
      );
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Team member invited successfully',
      data: user.teamMembers.find(m => m.email === email),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team member role
// @route   PUT /api/team/:email
// @access  Private
export const updateTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { email } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'agent'].includes(role)) {
      throw new BadRequestError('Valid role (admin/agent) is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const memberIndex = user.teamMembers.findIndex(m => m.email === email);
    if (memberIndex === -1) {
      throw new NotFoundError('Team member not found');
    }

    user.teamMembers[memberIndex].role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: user.teamMembers[memberIndex],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove team member
// @route   DELETE /api/team/:email
// @access  Private
export const removeTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { email } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Can't remove yourself
    if (email === user.email) {
      throw new BadRequestError('You cannot remove yourself from the team');
    }

    const memberIndex = user.teamMembers.findIndex(m => m.email === email);
    if (memberIndex === -1) {
      throw new NotFoundError('Team member not found');
    }

    user.teamMembers.splice(memberIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team online status
// @route   GET /api/team/online
// @access  Private
export const getOnlineTeamMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This will be integrated with realtime server
    // For now, return placeholder
    res.status(200).json({
      success: true,
      data: {
        online: [],
        offline: [],
      },
    });
  } catch (error) {
    next(error);
  }
};