// server/src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import User, { IUser } from '../models/User';
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupProductSchema,
  setupWidgetSchema,
  setupBrandingSchema,
  setupTeamSchema,
  setupIntegrationsSchema,
  updateProfileSchema
} from '../utils/validation';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { emailTemplates } from '../utils/emailTemplates';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { CustomError, UnauthorizedError, BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendMail } from '../utils/mailer';

// Helper function to create tokens
const createTokens = (userId: string) => {
  const accessToken = signAccess({ id: userId });
  const refreshToken = signRefresh({ id: userId });
  return { accessToken, refreshToken };
};

// Helper function to set cookie
const setTokenCookie = (res: Response, token: string, name: string = 'refreshToken') => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// Helper to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper to check account lock
const checkAccountLock = (user: IUser) => {
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw new BadRequestError(
      `Account is locked. Please try again in ${remainingTime} minute(s)`
    );
  }
};

// Helper to handle login attempts
const handleLoginAttempt = async (user: IUser, success: boolean) => {
  if (success) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
  } else {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }
  }
  await user.save({ validateBeforeSave: false });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false,
    });

    // Generate verification token
    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    await sendMail(
      user.email,
      emailTemplates.verifyEmail(user.name, verificationUrl).subject,
      emailTemplates.verifyEmail(user.name, verificationUrl).html
    );

    // Generate tokens
    const { accessToken, refreshToken } = createTokens(user._id.toString());

    // Set refresh token cookie
    setTokenCookie(res, refreshToken);

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check account lock
    checkAccountLock(user);

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await handleLoginAttempt(user, false);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login attempts on success
    await handleLoginAttempt(user, true);

    // Generate tokens
    const { accessToken, refreshToken } = createTokens(user._id.toString());

    // Set refresh token cookie
    setTokenCookie(res, refreshToken);

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);
    const { token } = validatedData;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    await sendMail(
      user.email,
      emailTemplates.verifyEmail(user.name, verificationUrl).subject,
      emailTemplates.verifyEmail(user.name, verificationUrl).html
    );

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    await sendMail(
      user.email,
      emailTemplates.resetPassword(user.name, resetUrl).subject,
      emailTemplates.resetPassword(user.name, resetUrl).html
    );

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // Verify refresh token
    const decoded = verifyRefresh(refreshToken);
    const userId = decoded.id as string;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = createTokens(user._id.toString());

    // Set new refresh token cookie
    setTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// server/src/controllers/authController.ts - Update the updateProfile function

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update fields
    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.companyName) user.companyName = validatedData.companyName;
    if (validatedData.setupCompleted !== undefined) {
      user.setupCompleted = validatedData.setupCompleted;
    }
    
    // Update widget settings if provided
    if (validatedData.widgetSettings) {
      user.widgetSettings = {
        ...user.widgetSettings,
        ...validatedData.widgetSettings,
      };
    }

    // Update products if provided
    if (validatedData.products) {
      user.products = validatedData.products;
    }

    // Update team members if provided
    if (validatedData.teamMembers) {
      user.teamMembers = validatedData.teamMembers.map((teamMember) => ({
        ...teamMember,
        invitedAt: teamMember.invitedAt ?? new Date(),
      }));
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
      }

      const result = await uploadToCloudinary(req.file.buffer, 'avatars');
      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;
    } else if (validatedData.avatar && validatedData.avatar.startsWith('data:image')) {
      // Fallback for base64
      const base64Data = validatedData.avatar.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);
      
      const result = await uploadToCloudinary(buffer, 'avatars');
      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;
    }

    await user.save();

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Setup product selection
// @route   POST /api/auth/setup/product
// @access  Private
export const setupProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = setupProductSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { productId } = validatedData;
    const validProducts = ['live-chat', 'ticketing', 'knowledge-base', 'pages'];

    if (!validProducts.includes(productId)) {
      throw new BadRequestError('Invalid product selected');
    }

    // Add product if not already present
    if (!user.products.includes(productId)) {
      user.products.push(productId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product selected successfully',
      data: {
        products: user.products,
        setupProgress: {
          currentStep: 'product',
          completed: ['product'],
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};


// @desc    Setup widget
// @route   POST /api/auth/setup/widget
// @access  Private
export const setupWidget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = setupWidgetSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.widgetSettings = {
      ...user.widgetSettings,
      position: validatedData.position,
      color: validatedData.color,
      icon: validatedData.icon,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Widget settings saved successfully',
      data: {
        widgetSettings: user.widgetSettings,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Setup branding
// @route   POST /api/auth/setup/branding
// @access  Private
export const setupBranding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let validatedData;
    
    // Check if request is multipart/form-data or JSON
    const isFormData = req.headers['content-type']?.includes('multipart/form-data');
    
    if (isFormData) {
      // Handle FormData - parse JSON strings
      validatedData = {
        companyName: req.body.companyName,
        brandColor: req.body.brandColor,
        font: req.body.font,
        welcomeMessage: req.body.welcomeMessage,
        quickReplies: req.body.quickReplies ? JSON.parse(req.body.quickReplies) : undefined,
      };
    } else {
      // Handle JSON
      validatedData = setupBrandingSchema.parse(req.body);
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update company name
    if (validatedData.companyName) {
      user.companyName = validatedData.companyName;
    }

    // Update widget settings
    user.widgetSettings = {
      ...user.widgetSettings,
      color: validatedData.brandColor || user.widgetSettings.color,
      font: validatedData.font || user.widgetSettings.font,
      welcomeMessage: validatedData.welcomeMessage || user.widgetSettings.welcomeMessage,
      quickReplies: validatedData.quickReplies ? validatedData.quickReplies.slice(0, 6) : user.widgetSettings.quickReplies,
    };

    // Handle logo upload if present (from FormData)
    if (req.file) {
      // Delete old logo if exists
      if (user.companyLogoPublicId) {
        await deleteFromCloudinary(user.companyLogoPublicId);
      }

      const result = await uploadToCloudinary(req.file.buffer, 'company-logos');
      user.companyLogo = result.secure_url;
      user.companyLogoPublicId = result.public_id;
    }

    // Also check if logo was sent as base64 in JSON (from non-formdata requests)
    if (!isFormData && req.body.logo && req.body.logo.startsWith('data:image')) {
      // Convert base64 to buffer
      const base64Data = req.body.logo.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Delete old logo if exists
      if (user.companyLogoPublicId) {
        await deleteFromCloudinary(user.companyLogoPublicId);
      }

      const result = await uploadToCloudinary(buffer, 'company-logos');
      user.companyLogo = result.secure_url;
      user.companyLogoPublicId = result.public_id;
    }

    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: 'Branding settings saved successfully',
      data: {
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        widgetSettings: user.widgetSettings,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Setup team
// @route   POST /api/auth/setup/team
// @access  Private
export const setupTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = setupTeamSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { members } = validatedData;

    // Add team members
    for (const member of members) {
      // Check if already invited
      const existing = user.teamMembers.find(
        (tm) => tm.email === member.email
      );
      if (!existing) {
        user.teamMembers.push({
          email: member.email,
          role: member.role,
          invitedAt: new Date(),
        });

        // Send invitation email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteUrl = `${frontendUrl}/accept-invite?token=${inviteToken}&email=${encodeURIComponent(member.email)}`;
        
        await sendMail(
          member.email,
          emailTemplates.teamInvitation(user.name, user.companyName || 'Comvia', inviteUrl).subject,
          emailTemplates.teamInvitation(user.name, user.companyName || 'Comvia', inviteUrl).html
        );
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Team members invited successfully',
      data: {
        teamMembers: user.teamMembers,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// server/src/controllers/authController.ts - Simpler version

// @desc    Setup integrations
// @route   POST /api/auth/setup/integrations
// @access  Private
export const setupIntegrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = setupIntegrationsSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { integrations } = validatedData;

    // Initialize integrations object if it doesn't exist
    if (!user.integrations) {
      user.integrations = {} as any;
    }

    // Define all possible integrations
    const allIntegrations = ['slack', 'email', 'facebook', 'instagram', 'twitter', 'github', 'zoom', 'zapier'] as const;
    type IntegrationKey = (typeof allIntegrations)[number];

    // Create a set of selected integration IDs for easy lookup
    const selectedSet = new Set<IntegrationKey>(integrations as IntegrationKey[]);

    // Update each integration
    allIntegrations.forEach((key) => {
      const isSelected = selectedSet.has(key);
      
      if (user.integrations[key]) {
        // Update existing integration
        user.integrations[key].enabled = isSelected;
      } else {
        // Create new integration with default values
        const defaultIntegration = (() => {
          switch (key) {
            case 'email':
              return {
                enabled: isSelected,
                notifications: {
                  newMessage: true,
                  newTicket: true,
                  teamInvite: true,
                },
              };
            case 'github':
              return {
                enabled: isSelected,
                syncIssues: true,
              };
            case 'zapier':
              return {
                enabled: isSelected,
                triggers: ['newMessage'],
              };
            default:
              return {
                enabled: isSelected,
              };
          }
        })();

        user.integrations[key] = defaultIntegration as any;
      }
    });

    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: 'Integrations saved successfully',
      data: {
        user: userResponse,
        integrations: user.integrations,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

// @desc    Complete setup
// @route   POST /api/auth/setup/complete
// @access  Private
export const completeSetup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if all required steps are done
    if (!user.products || user.products.length === 0) {
      throw new BadRequestError('Please select a product first');
    }
    
    if (!user.widgetSettings?.position) {
      throw new BadRequestError('Please configure widget settings first');
    }
    
    if (!user.companyName) {
      throw new BadRequestError('Please set up branding first');
    }
    
    if (!user.teamMembers || user.teamMembers.length === 0) {
      throw new BadRequestError('Please add at least one team member');
    }

    // Mark setup as complete - you can add a field for this
    user.setupCompleted = true;
    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).emailVerificationToken;
    delete (userResponse as any).emailVerificationExpires;
    delete (userResponse as any).resetPasswordToken;
    delete (userResponse as any).resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        user: userResponse,
        setupCompleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
};