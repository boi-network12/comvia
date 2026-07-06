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
     // ✅ Also include the current user if they're not in teamMembers
    if (!memberEmails.includes(req.user?.email)) {
      memberEmails.push(req.user?.email);
    }

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

    // ✅ Add the current user if they're not in the teamMembers array
    const currentUser = members.find(m => m.email === req.user?.email);
    if (currentUser && !teamWithDetails.find(m => m.email === currentUser.email)) {
      teamWithDetails.push({
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role as 'admin' | 'agent',
        invitedAt: new Date(),
        acceptedAt: new Date(),
        avatar: currentUser.avatar,
        isEmailVerified: currentUser.isEmailVerified,
        lastLogin: currentUser.lastLogin,
        isOnline: false,
      } as any);
    }

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
      const frontendUrl = process.env.FRONTEND_URL;
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

// @desc    Validate invitation
// @route   POST /api/team/validate-invite
// @access  Public
export const validateInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      throw new BadRequestError('Token and email are required');
    }

    // Find the user who sent the invitation (the inviter)
    const user = await User.findOne({
      'teamMembers.email': email,
      'teamMembers.invitedAt': { $exists: true },
    });

    if (!user) {
      throw new NotFoundError('Invalid or expired invitation');
    }

    // Find the specific team member
    const teamMember = user.teamMembers.find(m => m.email === email);
    
    if (!teamMember) {
      throw new NotFoundError('Invitation not found');
    }

    // Check if already accepted
    if (teamMember.acceptedAt) {
      throw new BadRequestError('Invitation already accepted');
    }

    res.status(200).json({
      success: true,
      data: {
        inviterName: user.name,
        companyName: user.companyName || 'Comvia',
        role: teamMember.role,
        email: email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept invitation
// @route   POST /api/team/accept-invite
// @access  Private
export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email } = req.body;
    const userId = req.user?.id;

    if (!token || !email) {
      throw new BadRequestError('Token and email are required');
    }

    // Find the inviter's user document
    const inviter = await User.findOne({
      'teamMembers.email': email,
      'teamMembers.invitedAt': { $exists: true },
    });

    if (!inviter) {
      throw new NotFoundError('Invalid or expired invitation');
    }

    // Find the team member
    const teamMemberIndex = inviter.teamMembers.findIndex(m => m.email === email);
    
    if (teamMemberIndex === -1) {
      throw new NotFoundError('Invitation not found');
    }

    // Check if already accepted
    if (inviter.teamMembers[teamMemberIndex].acceptedAt) {
      throw new BadRequestError('Invitation already accepted');
    }

    // Mark as accepted
    inviter.teamMembers[teamMemberIndex].acceptedAt = new Date();
    await inviter.save();

    // If the user is already registered, add them to the team
    if (userId) {
      // Find the user who accepted
      const user = await User.findById(userId);
      if (user) {
        // Update user's company info
        if (!user.companyName) {
          user.companyName = inviter.companyName || 'Comvia';
        }

        // ✅ Copy widget settings from inviter
        if (inviter.widgetSettings) {
          user.widgetSettings = {
            position: inviter.widgetSettings.position || 'bottom-right',
            color: inviter.widgetSettings.color || '#F97316',
            icon: inviter.widgetSettings.icon || 'chat',
            font: inviter.widgetSettings.font || 'inter',
            welcomeMessage: inviter.widgetSettings.welcomeMessage || 'Hi there! 👋 How can I help you today?',
            quickReplies: inviter.widgetSettings.quickReplies || ['Pricing', 'Features', 'Support', 'Demo'],
          };
        }
        
        // ✅ Copy products from inviter
        if (inviter.products && inviter.products.length > 0) {
          user.products = inviter.products;
        }
        
        // ✅ Mark setup as completed (so they don't go through setup wizard)
        user.setupCompleted = true;

        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        teamMember: inviter.teamMembers[teamMemberIndex],
        companyName: inviter.companyName || 'Comvia',
      },
    });
  } catch (error) {
    next(error);
  }
};