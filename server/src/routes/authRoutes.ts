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
} from '../controllers/authController';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';
import { uploadAvatar, uploadCompanyLogo } from '../middlewares/uploadMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
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

export default router;