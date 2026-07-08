// server/src/controllers/messageController.ts
import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

// @desc    Send message
// @route   POST /api/messages
// @access  Private
// export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     const userRole = req.user?.role || 'agent' || 'user' || 'admin';
//     const { conversationId, content, type, replyTo } = req.body;

//     console.log(`📤 [MESSAGE] Agent trying to send:`, { 
//       userId, 
//       userRole, 
//       conversationId, 
//       contentLength: content?.length 
//     });

//     if (!content) {
//       throw new BadRequestError('Message content is required');
//     }

//     if (!conversationId) {
//       throw new BadRequestError('Conversation ID is required');
//     }

//     // ✅ DON'T auto-create - just find existing conversation
//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation) {
//       throw new NotFoundError('Conversation not found');
//     }

//     // ✅ Check if user has access to this conversation
//     const hasAccess = 
//       conversation.userId === userId || 
//       conversation.assignedTo === userId || 
//       conversation.assignedToName === req.user?.name || 
//       conversation.participants?.some((p: any) => p.userId === userId) ||
//       ['admin', 'agent'].includes(req.user?.role || '') ||
//       req.user?.role === 'admin' || 
//       req.user?.role === 'agent' ||
//       req.user?.role === 'user';

//     if (!hasAccess) {
//       console.log(`❌ Access denied for user ${userId} on conversation ${conversationId}`);
//       console.log(`Conversation: userId=${conversation.userId}, assignedTo=${conversation.assignedTo}`);
//       throw new BadRequestError('You do not have access to this conversation');
//     }

//     // Create message
//     const message = await Message.create({
//       conversationId: conversation._id,
//       senderId: userId,
//       senderType: userRole,
//       senderName: req.user?.name,
//       content,
//       type: type || 'text',
//       replyTo,
//       status: 'sent',
//       readBy: [userId]
//     });

//     // Update conversation last message
//     conversation.lastMessage = {
//       content: content,
//       senderId: userId,
//       senderType: userRole === 'user' ? 'agent' : userRole,
//       sentAt: new Date(),
//     };
//     conversation.lastMessageAt = new Date();
//     conversation.lastMessagePreview = content.substring(0, 100);

//     // ✅ If agent is sending, increment unread count for visitor
//     if (userRole === 'agent' || userRole === 'admin') {
//       conversation.unreadCount = (conversation.unreadCount || 0) + 1;
//     }
    
//     await conversation.save();

//     const realtimeUrl = 'https://comvia-realtime.fly.dev';

//     try {
//       // Broadcast to all rooms
//       const broadcastData = {
//         event: 'new_message',
//         data: message
//       };
      
//       const response = await fetch(`${realtimeUrl}/api/broadcast`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(broadcastData)
//       });
      
//       console.log(`📤 Broadcast to realtime: ${response.status}`);
//     } catch (broadcastError) {
//       console.error('⚠️ Could not broadcast to realtime:', broadcastError);
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Message sent successfully',
//       data: message,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// server/src/controllers/messageController.ts
// server/src/controllers/messageController.ts
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { conversationId, content } = req.body;

    console.log("=== SEND MESSAGE DEBUG ===");
    console.log("User ID:", userId);
    console.log("User Role:", userRole);
    console.log("Conversation ID:", conversationId);
    console.log("Content:", content);
    console.log("Full req.user:", req.user);

    if (!userId) {
      console.error("❌ No userId in token!");
      throw new BadRequestError("Authentication required");
    }

    if (!conversationId || !content) {
      throw new BadRequestError("Missing conversationId or content");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error("❌ Conversation not found:", conversationId);
      throw new NotFoundError("Conversation not found");
    }

    console.log("Conversation found. Owner:", conversation.userId, "AssignedTo:", conversation.assignedTo);

    // Access check
    const hasAccess = 
      conversation.userId === userId || 
      conversation.assignedTo === userId ||
      ['admin', 'agent'].includes(userRole || '');

    if (!hasAccess) {
      console.error("❌ ACCESS DENIED");
      throw new BadRequestError("You do not have access to this conversation");
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderType: userRole || 'agent',
      senderName: req.user?.name || 'Agent',
      content,
      type: 'text',
      status: 'sent'
    });

    console.log("✅ Message CREATED successfully:", message._id);

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = content.substring(0, 100);
    await conversation.save();

    res.status(201).json({ success: true, data: message });

  } catch (error: any) {
    console.error("❌ sendMessage ERROR:", error.message);
    console.error("Stack:", error.stack);
    next(error);
  }
};

// @desc    Get messages for conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const { limit = 50, before } = req.query;

    // Check if user has access to conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { userId: userId },
        { 'participants.userId': userId },
        { assignedTo: userId },
      ],
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found or access denied');
    }

    // Build query
    const query: any = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: userId },
        senderId: { $ne: userId },
      },
      { $push: { readBy: userId } }
    );

    // Update participant last read
    await Conversation.updateOne(
      {
        _id: conversationId,
        'participants.userId': userId,
      },
      {
        $set: { 'participants.$.lastReadAt': new Date() },
      }
    );

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        total: messages.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
// @route   PUT /api/messages/:conversationId/read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const result = await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: userId },
        senderId: { $ne: userId },
      },
      { $push: { readBy: userId } }
    );

    // Update conversation unread count
    const unreadCount = await Message.countDocuments({
      conversationId,
      readBy: { $ne: userId },
      senderId: { $ne: userId },
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: unreadCount,
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: {
        markedCount: result.modifiedCount,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const conversations = await Conversation.find({
      $or: [
        { userId: userId },
        { 'participants.userId': userId },
        { assignedTo: userId },
      ],
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      readBy: { $ne: userId },
      senderId: { $ne: userId },
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

// Delete message (for admins/agents)
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const userRole = req.user?.role;

    if (!['admin', 'agent'].includes(userRole)) {
      throw new BadRequestError('Only admins and agents can delete messages');
    }

    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};