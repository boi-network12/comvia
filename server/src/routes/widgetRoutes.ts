import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getWidgetSettings,
  updateWidgetAppearance,
  updateWidgetContent,
  getWidgetEmbedScript,
  previewWidget,
} from '../controllers/widgetController';
import { getVisitors, trackVisitor } from '../controllers/visitorController';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

const router = Router();

// Public routes (for widget)
router.post('/track', trackVisitor);

// ✅ ADD THIS NEW ENDPOINT - Get visitor chat history (public)
router.get('/history/:visitorId', async (req, res) => {
  try {
    const { visitorId } = req.params;
    
    console.log(`📜 Fetching history for visitor: ${visitorId}`);

    // Find conversations for this visitor
    const conversations = await Conversation.find({
      'participants.userId': visitorId,
      'participants.userType': 'visitor'
    }).select('_id');
    
    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) {
      // No conversations found, return empty array
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Get all messages from these conversations
    const messages = await Message.find({
      conversationId: { $in: conversationIds }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('❌ Error fetching visitor history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

router.use(protect);

router.get('/settings', getWidgetSettings);
router.put('/appearance', updateWidgetAppearance);
router.put('/content', updateWidgetContent);
router.get('/embed', getWidgetEmbedScript);
router.get('/preview', previewWidget);
router.get('/visitors', getVisitors);

export default router;