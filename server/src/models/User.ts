// server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  avatarPublicId?: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  companyName?: string;
  companyLogo?: string;
  companyLogoPublicId?: string;
  widgetSettings: {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    color: string;
    icon: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
  };
  products: string[];
  teamMembers: Array<{
    email: string;
    role: 'admin' | 'agent';
    invitedAt: Date;
    acceptedAt?: Date;
  }>;
  integrations: {
    slack?: {
      webhookUrl: string;
      channel: string;
      enabled: boolean;
    };
    email?: {
      enabled: boolean;
      notifications: {
        newMessage: boolean;
        newTicket: boolean;
        teamInvite: boolean;
      };
    };
    facebook?: {
      pageId: string;
      accessToken: string;
      enabled: boolean;
      pageName?: string;
    };
    instagram?: {
      businessId: string;
      accessToken: string;
      enabled: boolean;
      username?: string;
    };
    twitter?: {
      userId: string;
      accessToken: string;
      accessTokenSecret: string;
      enabled: boolean;
      username?: string;
    };
    github?: {
      accessToken: string;
      repo: string;
      owner: string;
      enabled: boolean;
      syncIssues: boolean;
    };
    zoom?: {
      accountId: string;
      clientId: string;
      clientSecret: string;
      enabled: boolean;
      userId?: string;
    };
    zapier?: {
      webhookUrl: string;
      enabled: boolean;
      triggers: string[];
    };
  };
  setupCompleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    companyName: {
      type: String,
      trim: true,
    },
    companyLogo: String,
    companyLogoPublicId: String,
    setupCompleted: {
      type: Boolean,
      default: false,
    },
    widgetSettings: {
      position: {
        type: String,
        enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
        default: 'bottom-right',
      },
      color: {
        type: String,
        default: '#F97316',
      },
      icon: {
        type: String,
        default: 'chat',
      },
      font: {
        type: String,
        default: 'inter',
      },
      welcomeMessage: {
        type: String,
        default: 'Hi there! 👋 How can I help you today?',
      },
      quickReplies: {
        type: [String],
        default: ['Pricing', 'Features', 'Support', 'Demo'],
      },
    },
    products: {
      type: [String],
      default: ['live-chat'],
    },
    teamMembers: [
      {
        email: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'agent'],
          default: 'agent',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        acceptedAt: Date,
      },
    ],
    integrations: {
      slack: {
        webhookUrl: {
          type: String,
          trim: true,
        },
        channel: {
          type: String,
          trim: true,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
      },
      email: {
        enabled: {
          type: Boolean,
          default: true,
        },
        notifications: {
          newMessage: {
            type: Boolean,
            default: true,
          },
          newTicket: {
            type: Boolean,
            default: true,
          },
          teamInvite: {
            type: Boolean,
            default: true,
          },
        },
      },
      facebook: {
        pageId: {
          type: String,
          trim: true,
        },
        accessToken: {
          type: String,
          trim: true,
          select: false,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        pageName: {
          type: String,
          trim: true,
        },
      },
      instagram: {
        businessId: {
          type: String,
          trim: true,
        },
        accessToken: {
          type: String,
          trim: true,
          select: false,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        username: {
          type: String,
          trim: true,
        },
      },
      twitter: {
        userId: {
          type: String,
          trim: true,
        },
        accessToken: {
          type: String,
          trim: true,
          select: false,
        },
        accessTokenSecret: {
          type: String,
          trim: true,
          select: false,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        username: {
          type: String,
          trim: true,
        },
      },
      github: {
        accessToken: {
          type: String,
          trim: true,
          select: false,
        },
        repo: {
          type: String,
          trim: true,
        },
        owner: {
          type: String,
          trim: true,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        syncIssues: {
          type: Boolean,
          default: true,
        },
      },
      zoom: {
        accountId: {
          type: String,
          trim: true,
        },
        clientId: {
          type: String,
          trim: true,
        },
        clientSecret: {
          type: String,
          trim: true,
          select: false,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        userId: {
          type: String,
          trim: true,
        },
      },
      zapier: {
        webhookUrl: {
          type: String,
          trim: true,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        triggers: {
          type: [String],
          enum: ['newMessage', 'newTicket', 'newLead', 'ticketClosed'],
          default: ['newMessage'],
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);