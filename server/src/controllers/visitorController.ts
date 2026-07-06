// server/src/controllers/visitorController.ts
import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { v4 as uuidv4 } from 'uuid';

// @desc    Track visitor
// @route   POST /api/widget/track
// @access  Public
export const trackVisitor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorId, name, email, page, referrer, userAgent, ip, socketId } = req.body;

    // Check if visitor already has a conversation
    let conversation = await Conversation.findOne({
      'participants.userId': visitorId,
      'participants.userType': 'visitor',
      isActive: true,
    });

    if (!conversation) {
      // Create new conversation for visitor
      conversation = await Conversation.create({
        userId: visitorId,
        visitorId: visitorId,
        title: `Conversation with ${name || 'Visitor'}`,
        status: 'open',
        channel: 'widget',
        participants: [
          {
            userId: visitorId,
            userType: 'visitor',
            name: name || 'Anonymous Visitor',
            email: email,
            joinedAt: new Date(),
          },
        ],
        metadata: {
          visitorName: name || 'Anonymous Visitor',
          visitorEmail: email,
          page: page,
          ip: ip,
        },
        lastMessageAt: new Date(),
      });

      // Add system message
      await Message.create({
        conversationId: conversation._id,
        senderId: 'system',
        senderType: 'system',
        content: `${name || 'A visitor'} has started a conversation`,
        type: 'system',
        status: 'sent',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        visitorId: visitorId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visitor conversations (for agents)
// @route   GET /api/widget/visitors
// @access  Private (Agent/Admin)
export const getVisitors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const conversations = await Conversation.find({
      'participants.userType': 'visitor',
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Conversation.countDocuments({
      'participants.userType': 'visitor',
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        visitors: conversations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};