// server/src/routes/teamRoutes.ts - Add these routes
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  getOnlineTeamMembers,
  validateInvitation,  // Add this
  acceptInvitation,    // Add this
} from '../controllers/teamController';

const router = Router();

// Public routes (no authentication needed)
router.post('/validate-invite', validateInvitation);

// Protected routes (require authentication)
router.use(protect);

router.get('/', getTeamMembers);
router.get('/online', getOnlineTeamMembers);
router.post('/invite', inviteTeamMember);
router.put('/:email', updateTeamMember);
router.delete('/:email', removeTeamMember);
router.post('/accept-invite', acceptInvitation);

export default router;