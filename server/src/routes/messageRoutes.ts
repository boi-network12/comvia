// server/src/routes/messageRoutes.ts
import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth';
import {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} from '../controllers/messageController';

const router = Router();

// All routes require authentication
router.use(protect);

// Send message
router.post('/ww', sendMessage);

// Get messages for conversation
router.get('/:conversationId', getMessages);

// Mark messages as read
router.put('/:conversationId/read', markAsRead);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Delete message (admin/agent only)
router.delete('/:messageId', restrictTo('admin', 'agent'), deleteMessage);

export default router;