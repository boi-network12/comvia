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

// router.post('/visitor/message', async (req, res) => {
//   try {
//     const { content, sender, userId, timestamp, companyId } = req.body;
    
//     console.log(`📨 Visitor message from ${userId}:`, content);

//     // ✅ FIX: Use the userId as the visitorId for lookup
//     // But ALSO check if there's a persistent visitor ID from localStorage
//     // let visitorId = userId;

//     // 🔥 FIX: Find existing conversation for this visitor
//     // Use a simpler query - just find by visitorId
//     let conversation = await Conversation.findOne({
//       visitorId: userId,
//       companyId: companyId,
//       status: { $in: ['open', 'in-progress'] } 
//     });

//     // If no active conversation found, try to find any conversation with this visitor
//      if (!conversation) {
//       conversation = await Conversation.findOne({
//         $or: [
//           { visitorId: userId },
//           { 'metadata.visitorId': userId }
//         ],
//         companyId
//       }).sort({ createdAt: -1 });
//     }

//     // If still no conversation, create a new one
//     if (!conversation) {
//       const companyUser = await User.findOne({ companyId });
//       if (!companyUser) return res.status(404).json({ success: false, message: 'Company not found' });

      
//        conversation = await Conversation.create({
//         userId: companyUser._id,
//         visitorId: userId,
//         companyId,
//         title: `Chat with Visitor`,
//         status: 'open',
//         priority: 'medium',
//         channel: 'widget',
//         assignedTo: companyUser._id,
//         assignedToName: companyUser.name,
//         metadata: {
//           visitorName: 'Visitor',
//           visitorId: userId, // ✅ Store the visitor ID in metadata
//           page: req.headers.referer || 'Unknown',
//           companyId: companyId,
//           ...req.body.metadata
//         },
//         lastMessageAt: new Date(),
//         lastMessagePreview: content.substring(0, 100)
//       });
//       console.log(`✅ Created new conversation: ${conversation._id}`);
//     } else {
//       console.log(`📌 Found existing conversation: ${conversation._id}`);
      
//       // If conversation was closed/resolved, reopen it
//       if (conversation.status === 'resolved' || conversation.status === 'closed') {
//         conversation.status = 'open';
//         await conversation.save();
//         console.log(`🔄 Reopened conversation: ${conversation._id}`);
//       }
//     }

//     // Save visitor message
//     const message = await Message.create({
//       conversationId: conversation._id,
//       senderId: userId,
//       senderType: 'visitor',
//       content: content,
//       type: 'text',
//       status: 'sent'
//     });

//     // Update conversation
//     conversation.lastMessageAt = new Date();
//     conversation.lastMessagePreview = content.substring(0, 100);
//     conversation.unreadCount = (conversation.unreadCount || 0) + 1;
//     await conversation.save();

//     // 🔥 GET AUTO-REPLY
//     const autoReplyContent = getAutoReply(content);
    
//     // 🔥 SAVE AUTO-REPLY TO DATABASE
//     const autoReplyMessage = await Message.create({
//       conversationId: conversation._id,
//       senderId: 'system',
//       senderType: 'system',
//       content: autoReplyContent,
//       type: 'text',
//       status: 'sent'
//     });

//     // 🔥 UPDATE CONVERSATION WITH AUTO-REPLY
//     conversation.lastMessageAt = new Date();
//     conversation.lastMessagePreview = autoReplyContent.substring(0, 100);
//     conversation.unreadCount = (conversation.unreadCount || 0) + 1;
//     await conversation.save();

//     // 🔥 BROADCAST TO REALTIME
//     const RealtimeUrl = 'https://comvia-realtime.fly.dev';

//     try {
//       // Send visitor message
//       await fetch(`${RealtimeUrl}/api/broadcast`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           event: 'new_visitor_message',
//           data: {
//             conversationId: conversation._id,
//             message: message,
//             visitorId: userId,
//             companyId: companyId,
//             conversation: conversation
//           }
//         })
//       });

//       // 🔥 ALSO BROADCAST AUTO-REPLY
//       await fetch(`${RealtimeUrl}/api/broadcast`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           event: 'new_visitor_message',
//           data: {
//             conversationId: conversation._id,
//             message: autoReplyMessage,
//             visitorId: userId,
//             companyId: companyId,
//             conversation: conversation
//           }
//         })
//       });

//       console.log(`📤 Broadcasted visitor message and auto-reply to realtime`);
//     } catch (broadcastError: unknown) {
//       const bcError = broadcastError as Error;
//       console.log('⚠️ Could not broadcast to realtime:', bcError.message);
//     }

//     // Send response back to widget
//     res.json({
//       success: true,
//       data: {
//         reply: autoReplyContent,
//         messageId: message._id,
//         conversationId: conversation._id,
//         autoReplyId: autoReplyMessage._id
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error handling visitor message:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process message'
//     });
//   }
// });

router.post('/visitor/message', async (req, res) => {
  try {
    const { content, userId, companyId, metadata } = req.body;
    
    console.log(`📨 Visitor message from ${userId}:`, content);

    if (!content || !userId || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: content, userId, companyId'
      });
    }

    // ==================== FIND OR CREATE CONVERSATION ====================
    let conversation = await Conversation.findOne({
      visitorId: userId,
      companyId: companyId,
      status: { $in: ['open', 'in-progress'] }
    });

    // If no active conversation, check for any conversation
    if (!conversation) {
      conversation = await Conversation.findOne({
        $or: [
          { visitorId: userId },
          { 'metadata.visitorId': userId }
        ],
        companyId
      }).sort({ createdAt: -1 });
    }

    // If still no conversation, CREATE ONE
    if (!conversation) {
      const companyUser = await User.findOne({ companyId });
      if (!companyUser) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }

      conversation = await Conversation.create({
        userId: companyUser._id,
        visitorId: userId,
        companyId,
        title: `Chat with Visitor`,
        status: 'open',
        priority: 'medium',
        channel: 'widget',
        assignedTo: companyUser._id,
        assignedToName: companyUser.name,
        metadata: {
          visitorName: 'Visitor',
          visitorId: userId,
          page: req.headers.referer || 'Unknown',
          companyId: companyId,
          ...metadata
        },
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100)
      });
      console.log(`✅ Created new conversation: ${conversation._id}`);
    } else {
      console.log(`📌 Found existing conversation: ${conversation._id}`);
      
      // If conversation was closed/resolved, reopen it
      if (conversation.status === 'resolved' || conversation.status === 'closed') {
        conversation.status = 'open';
        await conversation.save();
        console.log(`🔄 Reopened conversation: ${conversation._id}`);
      }
    }

    // ==================== SAVE MESSAGE ====================
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      senderType: 'visitor',
      content: content,
      type: 'text',
      status: 'sent'
    });

    // ==================== UPDATE CONVERSATION ====================
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = content.substring(0, 100);
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();

    // ==================== AUTO-REPLY ====================
    const autoReplyContent = getAutoReply(content);
    
    let autoReplyMessage = null;
    if (autoReplyContent) {
      autoReplyMessage = await Message.create({
        conversationId: conversation._id,
        senderId: 'system',
        senderType: 'system',
        content: autoReplyContent,
        type: 'text',
        status: 'sent'
      });

      // Update conversation again
      conversation.lastMessageAt = new Date();
      conversation.lastMessagePreview = autoReplyContent.substring(0, 100);
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();
    }

    // ==================== BROADCAST TO REALTIME ====================
    const RealtimeUrl = process.env.REALTIME_URL || 'https://comvia-realtime.fly.dev';

    try {
      // Broadcast visitor message
      await fetch(`${RealtimeUrl}/api/broadcast`, {
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

      // Broadcast auto-reply if exists
      if (autoReplyMessage) {
        await fetch(`${RealtimeUrl}/api/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_visitor_message',
            data: {
              conversationId: conversation._id,
              message: autoReplyMessage,
              visitorId: userId,
              companyId: companyId,
              conversation: conversation
            }
          })
        });
      }

      console.log(`📤 Broadcasted messages to realtime`);
    } catch (broadcastError) {
      console.log('⚠️ Could not broadcast to realtime:', broadcastError);
    }

    // ==================== RESPONSE ====================
    res.json({
      success: true,
      data: {
        messageId: message._id,
        conversationId: conversation._id,
        reply: autoReplyContent,
        autoReplyId: autoReplyMessage?._id || null
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