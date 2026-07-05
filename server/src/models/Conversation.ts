import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system' | 'visitor';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  readBy: string[];
  createdAt: Date;
}

export interface IConversation extends Document {
  userId: string;
  visitorId?: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  channel: 'widget' | 'email' | 'facebook' | 'instagram' | 'twitter' | 'api';
  tags: string[];
  rating?: number;
  ratingComment?: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  resolvedAt?: Date;
  escalatedAt?: Date;
  metadata: {
    visitorName?: string;
    visitorEmail?: string;
    page?: string;
    browser?: string;
    location?: string;
    ip?: string;
  };
  internalNotes: Array<{
    content: string;
    createdBy: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['user', 'agent', 'system', 'visitor'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text',
  },
  readBy: [String],
}, {
  timestamps: true,
});

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  visitorId: String,
  title: {
    type: String,
    default: 'New Conversation',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'escalated', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: String,
  assignedToName: String,
  channel: {
    type: String,
    enum: ['widget', 'email', 'facebook', 'instagram', 'twitter', 'api'],
    default: 'widget',
  },
  tags: [String],
  rating: Number,
  ratingComment: String,
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  lastMessagePreview: String,
  unreadCount: {
    type: Number,
    default: 0,
  },
  resolvedAt: Date,
  escalatedAt: Date,
  metadata: {
    visitorName: String,
    visitorEmail: String,
    page: String,
    browser: String,
    location: String,
    ip: String,
  },
  internalNotes: [{
    content: String,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ userId: 1, assignedTo: 1 });
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);