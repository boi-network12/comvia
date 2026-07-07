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
import { getAutoReply } from '../helper/replyHelper';
import User from '../models/User';

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

router.post('/visitor/message', async (req, res) => {
  try {
    const { content, sender, userId, timestamp, companyId } = req.body;
    
    console.log(`📨 Visitor message from ${userId}:`, content);

    // Find or create conversation for this visitor
    let conversation = await Conversation.findOne({
      'participants.userId': userId,
      'participants.userType': 'visitor',
      companyId: companyId,
      isActive: true
    });

    if (!conversation) {
      // ✅ Find the company user to get settings
      const companyUser = await User.findOne({ companyId: companyId });

       if (!companyUser) {
        console.error(`❌ Company not found: ${companyId}`);
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }


      // Create new conversation
      conversation = await Conversation.create({
        userId: companyUser._id,
        visitorId: userId,
        companyId: companyId,
        title: `Chat with Visitor`,
        status: 'open',
        channel: 'widget',
        assignedTo: companyUser._id, 
        assignedToName: companyUser.name,
        participants: [{
          userId: userId,
          userType: 'visitor',
          name: 'Visitor',
          joinedAt: new Date()
        },{
          userId: companyUser._id,
          userType: 'agent',
          name: companyUser.name,
          joinedAt: new Date()
        }],
        metadata: {
          visitorName: 'Visitor',
          page: req.headers.referer || 'Unknown',
          companyId: companyId,
        },
        lastMessageAt: new Date()
      });
      console.log(`✅ [WIDGET] Created new conversation: ${conversation._id}`);
    }

    // Save message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      senderType: 'visitor',
      content: content,
      type: 'text',
      status: 'sent'
    });

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = content.substring(0, 100);
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();

    // process.env.REALTIME_URL ||
    const RealtimeUrl =  'https://comvia-realtime.fly.dev'

    try {
      const realtimeUrl = RealtimeUrl;
      await fetch(`${realtimeUrl}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_visitor_message',
          data: {
            conversationId: conversation._id,
            message: message,
            visitorId: userId,
            companyId: companyId,
            conversation: conversation
          }
        })
      });
      console.log(`📤 [WIDGET] Broadcasted to realtime server`);
    } catch (broadcastError: unknown) {
      const bcError = broadcastError as Error;
      console.log('⚠️ [WIDGET] Could not broadcast to realtime:', bcError.message);
    }

    // Get auto-reply (you can customize this)
    const autoReply = getAutoReply(content);

    // Send response
    res.json({
      success: true,
      data: {
        reply: autoReply,
        messageId: message._id,
        conversationId: conversation._id
      }
    });

  } catch (error) {
    console.error('❌ Error handling visitor message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
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