// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';
import User from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes - requires authentication
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in. Please log in to access this resource.');
    }

    // Verify token
    const decoded = verifyAccess(token);
    const userId = decoded.id as string;

    // Check if user still exists
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('You are not logged in');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
};

// Check if email is verified
export const isEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('You are not logged in');
    }

    if (!req.user.isEmailVerified) {
      throw new ForbiddenError('Please verify your email address to access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};