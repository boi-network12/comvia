import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const isSetupComplete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('You are not logged in');
    }

    // Skip setup check for setup routes
    if (req.path.includes('/setup')) {
      return next();
    }

    if (!req.user.setupCompleted) {
      throw new ForbiddenError('Please complete your account setup first');
    }

    next();
  } catch (error) {
    next(error);
  }
};