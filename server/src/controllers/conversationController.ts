import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import User from '../models/User';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import Message from '../models/Message';

// @desc    Get all conversations
// @route   GET /api/conversations
// @access  Private
// export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     const { status, assignedTo, page = 1, limit = 20, search } = req.query;

//      const query: any = {};
    
//     // ✅ Find conversations assigned to this user OR where user is the company
//     query.$or = [
//       { assignedTo: userId },
//       { companyId: req.user?.companyId } // If we store companyId on user
//     ];

//     if (status) query.status = status;
//     if (assignedTo) query.assignedTo = assignedTo;
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { 'metadata.visitorName': { $regex: search, $options: 'i' } },
//         { 'metadata.visitorEmail': { $regex: search, $options: 'i' } },
//       ];
//     }

//     const skip = (Number(page) - 1) * Number(limit);

//     const [conversations, total] = await Promise.all([
//       Conversation.find(query)
//         .sort({ lastMessageAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       Conversation.countDocuments(query),
//     ]);

//     // Get unread count
//     const unreadCount = await Conversation.countDocuments({
//       ...query,
//       unreadCount: { $gt: 0 },
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         conversations,
//         pagination: {
//           page: Number(page),
//           limit: Number(limit),
//           total,
//           pages: Math.ceil(total / Number(limit)),
//         },
//         unreadCount,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { status, assignedTo, page = 1, limit = 20, search } = req.query;

    // ✅ SIMPLE FIX: Query by userId (since that's where you stored the company user's ID)
    const query: any = { userId: userId };
    
    // ✅ ALSO check assignedTo for conversations assigned to this user
    // If a conversation was created with assignedTo, it should also show up
    const queryWithOr: any = {
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    };

    // Use the OR query instead
    const finalQuery = queryWithOr;

    if (status) finalQuery.status = status;
    if (assignedTo) finalQuery.assignedTo = assignedTo;
    if (search) {
      finalQuery.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { 'metadata.visitorName': { $regex: search, $options: 'i' } },
            { 'metadata.visitorEmail': { $regex: search, $options: 'i' } },
          ]
        }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    console.log(`🔍 [SERVER] Fetching conversations for user: ${userId}`);
    console.log(`🔍 [SERVER] Query:`, JSON.stringify(finalQuery, null, 2));

    const [conversations, total] = await Promise.all([
      Conversation.find(finalQuery)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Conversation.countDocuments(finalQuery),
    ]);

    console.log(`✅ [SERVER] Found ${conversations.length} conversations`);

    // Get unread count
    const unreadCount = await Conversation.countDocuments({
      ...finalQuery,
      unreadCount: { $gt: 0 },
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single conversation with messages
// @route   GET /api/conversations/:id
// @access  Private
export const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOne({
      _id: id,
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Get messages
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { conversationId: id, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { title, channel, metadata, visitorId } = req.body;

    const conversation = await Conversation.create({
      userId,
      visitorId,
      title: title || 'New Conversation',
      channel: channel || 'widget',
      metadata: metadata || {},
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update conversation
// @route   PUT /api/conversations/:id
// @access  Private
export const updateConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status, priority, assignedTo, tags, rating, ratingComment } = req.body;

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // If status is changing to resolved, set resolvedAt
    if (status === 'resolved' && conversation.status !== 'resolved') {
      req.body.resolvedAt = new Date();
    }

    // If status is changing to escalated
    if (status === 'escalated' && conversation.status !== 'escalated') {
      req.body.escalatedAt = new Date();
    }

    // If assignedTo is changing, get the user's name
    if (assignedTo && assignedTo !== conversation.assignedTo) {
      const user = await User.findById(assignedTo);
      req.body.assignedToName = user?.name || assignedTo;
    }

    const updated = await Conversation.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add internal note to conversation
// @route   POST /api/conversations/:id/notes
// @access  Private
export const addInternalNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError('Note content is required');
    }

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    conversation.internalNotes.push({
      content,
      createdBy: userId,
      createdAt: new Date(),
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: conversation.internalNotes[conversation.internalNotes.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation stats
// @route   GET /api/conversations/stats
// @access  Private
export const getConversationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const baseQuery = {
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    };

    const [total, open, inProgress, resolved, escalated, unassigned, highPriority] = await Promise.all([
      Conversation.countDocuments({ userId }),
      Conversation.countDocuments({ userId, status: 'open' }),
      Conversation.countDocuments({ userId, status: 'in-progress' }),
      Conversation.countDocuments({ userId, status: 'resolved' }),
      Conversation.countDocuments({ userId, status: 'escalated' }),
      Conversation.countDocuments({ userId, assignedTo: { $exists: false } }),
      Conversation.countDocuments({ userId, priority: 'high' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        escalated,
        unassigned,
        highPriority,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation as read
// @route   POST /api/conversations/:id/read
// @access  Private
export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOne({
      _id: id,
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Mark all messages as read
    await Message.updateMany(
      { conversationId: id, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
      data: { unreadCount: 0 },
    });
  } catch (error) {
    next(error);
  }
};