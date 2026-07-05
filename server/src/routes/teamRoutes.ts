import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  getOnlineTeamMembers,
} from '../controllers/teamController';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getTeamMembers);
router.get('/online', getOnlineTeamMembers);
router.post('/invite', inviteTeamMember);
router.put('/:email', updateTeamMember);
router.delete('/:email', removeTeamMember);

export default router;