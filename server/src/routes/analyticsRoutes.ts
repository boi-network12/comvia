import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getAnalytics,
  getConversationMetrics,
  getTeamPerformanceAnalytics,
} from '../controllers/analyticsController';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getAnalytics);
router.get('/conversations', getConversationMetrics);
router.get('/team', getTeamPerformanceAnalytics);

export default router;