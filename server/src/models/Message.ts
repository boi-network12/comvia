// server/src/models/Message.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'admin' | 'visitor' | 'system';
  senderName?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  readBy: string[];
  deliveredTo: string[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'agent', 'admin', 'visitor', 'system'],
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    readBy: {
      type: [String],
      default: [],
    },
    deliveredTo: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    replyTo: {
      type: String,
      ref: 'Message',
    },
    metadata: {
      ip: String,
      userAgent: String,
      location: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ status: 1 });

// ✅ Prevent model overwrite error during development
const MessageModel: Model<IMessage> = 
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export const Message = MessageModel;
export default Message;