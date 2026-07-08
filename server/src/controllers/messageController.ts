// server/src/controllers/messageController.ts
import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'agent';
    const { conversationId, content, type = 'text' } = req.body;

    console.log("=== SEND MESSAGE DEBUG ===");
    console.log("User ID:", userId);
    console.log("Role:", userRole);
    console.log("Conversation ID:", conversationId);
    console.log("Content:", content);

    if (!userId) throw new BadRequestError("Authentication required");
    if (!conversationId) throw new BadRequestError("Conversation ID required");
    if (!content?.trim()) throw new BadRequestError("Content required");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const hasAccess = 
      conversation.userId === userId || 
      conversation.assignedTo === userId ||
      ['admin', 'agent'].includes(userRole);

    if (!hasAccess) {
      console.error("❌ ACCESS DENIED for user", userId);
      throw new BadRequestError("Access denied");
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderType: userRole,
      senderName: req.user?.name || 'Agent',
      content: content.trim(),
      type,
      status: 'sent'
    });

    console.log("✅ Message saved:", message._id);

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = content.trim().substring(0, 100);
    await conversation.save();

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    console.error("❌ sendMessage ERROR:", error.message);
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