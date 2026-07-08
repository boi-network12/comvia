import mongoose, { Document, Schema } from 'mongoose';
import { IMessage } from './Message'; 


export interface IConversation extends Document {
  userId: string;
  visitorId?: string;
  companyId?: string;
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
  participants: Array<{
    userId: string;
    userType: 'user' | 'agent' | 'admin' | 'visitor';
    name?: string;
    email?: string;
    joinedAt: Date;
    lastReadAt?: Date;
  }>;
  isActive: boolean;
  assignedAt?: Date;
  lastMessage?: {
    content: string;
    senderId: string;
    senderType: string;
    sentAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}


const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  visitorId: {
    type: String,
    index: true, // ✅ Add index
  },
  companyId: { // ✅ NEW FIELD
    type: String,
    index: true,
  },
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
    participants: [
      {
        userId: {
          type: String,
          required: true,
        },
        userType: {
          type: String,
          enum: ['user', 'agent', 'admin', 'visitor'],
          required: true,
        },
        name: String,
        email: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastReadAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedTo: {
      type: String,
      ref: 'User',
    },
    assignedAt: Date,
    lastMessage: {
      content: String,
      senderId: String,
      senderType: String,
      sentAt: Date,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ userId: 1, assignedTo: 1 });
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

// ✅ Prevent model overwrite error during development
const ConversationModel =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export const Conversation = ConversationModel;
export default Conversation;