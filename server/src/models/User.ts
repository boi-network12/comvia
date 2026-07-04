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
    };
    github?: {
      accessToken: string;
      repo: string;
    };
    // Add more integrations as needed
  };
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
        webhookUrl: String,
        channel: String,
      },
      github: {
        accessToken: String,
        repo: String,
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