// server/src/routes/integrationRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  connectSlack,
  disconnectSlack,
  getSlackStatus,
} from '../controllers/integrations/slackController';
import {
  connectFacebook,
  disconnectFacebook,
  getFacebookStatus,
} from '../controllers/integrations/facebookController';
import {
  connectGitHub,
  disconnectGitHub,
  getGitHubStatus,
} from '../controllers/integrations/githubController';
import {
  updateEmailSettings,
  getEmailSettings,
} from '../controllers/integrations/emailController';
import {
  connectZapier,
  disconnectZapier,
  getZapierStatus,
} from '../controllers/integrations/zapierController';

const router = Router();

// All integration routes require authentication
router.use(protect);

// Slack routes
router.post('/slack/connect', connectSlack);
router.delete('/slack/disconnect', disconnectSlack);
router.get('/slack/status', getSlackStatus);

// Facebook routes
router.post('/facebook/connect', connectFacebook);
router.delete('/facebook/disconnect', disconnectFacebook);
router.get('/facebook/status', getFacebookStatus);

// GitHub routes
router.post('/github/connect', connectGitHub);
router.delete('/github/disconnect', disconnectGitHub);
router.get('/github/status', getGitHubStatus);

// Email routes
router.put('/email/update', updateEmailSettings);
router.get('/email/settings', getEmailSettings);

// Zapier routes
router.post('/zapier/connect', connectZapier);
router.delete('/zapier/disconnect', disconnectZapier);
router.get('/zapier/status', getZapierStatus);

export default router;