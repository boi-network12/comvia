import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  addInternalNote,
  getConversationStats,
} from '../controllers/conversationController';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getConversations);
router.get('/stats', getConversationStats);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.put('/:id', updateConversation);
router.post('/:id/notes', addInternalNote);

export default router;