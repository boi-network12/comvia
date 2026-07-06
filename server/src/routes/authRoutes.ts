// server/src/routes/authRoutes.ts
import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  setupProduct,
  setupWidget,
  setupBranding,
  setupTeam,
  setupIntegrations,
  completeSetup,
  checkUser,
} from '../controllers/authController';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';
import { uploadAvatar, uploadCompanyLogo } from '../middlewares/uploadMiddleware';
import { isSetupComplete } from '../middlewares/setupMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/check-user', checkUser); 
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);


// Private routes (require authentication)
router.use(protect);

// Auth management
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', uploadAvatar, updateProfile);

// Setup routes
router.post('/setup/product', setupProduct);
router.post('/setup/widget', setupWidget);
router.post('/setup/branding', uploadCompanyLogo, setupBranding);
router.post('/setup/team', setupTeam);
router.post('/setup/integrations', setupIntegrations);
router.post('/setup/complete', completeSetup);

// Example protected route that requires email verification
router.get('/protected', isEmailVerified, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route',
    user: req.user,
  });
});

// Protected routes that require complete setup
router.get('/dashboard', isSetupComplete, (req, res) => {
  res.json({ success: true, message: 'Welcome to dashboard' });
});


export default router;