// server/src/models/CompanySettings.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanySettings extends Document {
  companyId: string;
  autoReply: {
    enabled: boolean;
    mode: 'smart' | 'always' | 'never' | 'agent-offline-only';
    cooldownMinutes: number;
    maxRepliesPerConversation: number;
    customReplies: {
      intent: string;
      reply: string;
      enabled: boolean;
    }[];
    fallbackReply: string;
    agentOnlineMessage: string;
    agentOfflineMessage: string;
    workingHours: {
      enabled: boolean;
      timezone: string;
      hours: {
        start: string; // "09:00"
        end: string;   // "17:00"
      };
      days: number[]; // 0=Sunday, 1=Monday, etc.
    };
  };
  agentDetection: {
    method: 'socket' | 'lastActivity' | 'both';
    inactivityTimeoutMinutes: number;
    checkIntervalSeconds: number;
  };
  updatedAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>({
  companyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  autoReply: {
    enabled: {
      type: Boolean,
      default: true,
    },
    mode: {
      type: String,
      enum: ['smart', 'always', 'never', 'agent-offline-only'],
      default: 'agent-offline-only',
    },
    cooldownMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 60,
    },
    maxRepliesPerConversation: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    customReplies: [{
      intent: {
        type: String,
        enum: ['pricing', 'features', 'support', 'demo', 'sales', 'technical', 'billing', 'urgent', 'human', 'general'],
        required: true,
      },
      reply: {
        type: String,
        required: true,
        maxlength: 500,
      },
      enabled: {
        type: Boolean,
        default: true,
      },
    }],
    fallbackReply: {
      type: String,
      default: '👋 Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to ask about pricing, features, or schedule a demo.',
    },
    agentOnlineMessage: {
      type: String,
      default: '👤 I\'ll connect you with a human agent right away. Please wait a moment...',
    },
    agentOfflineMessage: {
      type: String,
      default: '👤 Our team is currently offline. They\'ll get back to you within 24 hours. Please leave your message below.',
    },
    workingHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      hours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '17:00',
        },
      },
      days: {
        type: [Number],
        default: [1, 2, 3, 4, 5], // Monday to Friday
      },
    },
  },
  agentDetection: {
    method: {
      type: String,
      enum: ['socket', 'lastActivity', 'both'],
      default: 'both',
    },
    inactivityTimeoutMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 30,
    },
    checkIntervalSeconds: {
      type: Number,
      default: 30,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// ✅ Prevent model overwrite
export const CompanySettings = mongoose.models.CompanySettings || 
  mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);

export default CompanySettings;