// server/src/helper/smartReplyHelper.ts

import Message from '../models/Message';
import Conversation from '../models/Conversation';
import CompanySettings from '../models/CompanySettings';
import User from '../models/User';
import { Server as SocketServer } from 'socket.io';

// ============================================================
// TYPES
// ============================================================

export interface ReplyContext {
  conversationId: string;
  visitorId: string;
  companyId: string;
  messageHistory: any[];
  agentOnline: boolean;
  agentActive: boolean;
  timeSinceLastReply: number;
  messageCount: number;
  isUrgent: boolean;
  isFirstMessage: boolean;
  companySettings: any;
}

export interface ReplyResult {
  shouldReply: boolean;
  reply?: string;
  reason: string;
  type: 'auto' | 'agent' | 'none' | 'working-hours';
  metadata?: {
    intent?: string;
    confidence?: number;
    matchedKeyword?: string;
  };
}

export interface AgentStatus {
  online: boolean;
  active: boolean;
  lastActivity?: Date;
  count: number;
}

export interface Intent {
  type: 'pricing' | 'features' | 'support' | 'demo' | 'sales' | 'technical' | 'billing' | 'urgent' | 'human' | 'general';
  confidence: number;
  matchedKeywords: string[];
}

// ============================================================
// GLOBAL STATE (for agent tracking across companies)
// ============================================================

// Track online agents per company
const agentOnlineStatus = new Map<string, {
  agents: Map<string, { socketId: string; lastActivity: Date; name: string }>;
  lastUpdate: Date;
}>();

// ============================================================
// AGENT STATUS MANAGEMENT
// ============================================================

export function setAgentOnline(companyId: string, agentId: string, socketId: string, name: string): void {
  if (!agentOnlineStatus.has(companyId)) {
    agentOnlineStatus.set(companyId, {
      agents: new Map(),
      lastUpdate: new Date(),
    });
  }
  
  const company = agentOnlineStatus.get(companyId)!;
  company.agents.set(agentId, {
    socketId,
    lastActivity: new Date(),
    name,
  });
  company.lastUpdate = new Date();
}

export function setAgentOffline(companyId: string, agentId: string): void {
  const company = agentOnlineStatus.get(companyId);
  if (company) {
    company.agents.delete(agentId);
    company.lastUpdate = new Date();
  }
}

export function updateAgentActivity(companyId: string, agentId: string): void {
  const company = agentOnlineStatus.get(companyId);
  if (company && company.agents.has(agentId)) {
    const agent = company.agents.get(agentId)!;
    agent.lastActivity = new Date();
    company.lastUpdate = new Date();
  }
}

export function getAgentStatus(companyId: string, inactivityTimeout: number = 5): AgentStatus {
  const company = agentOnlineStatus.get(companyId);
  
  if (!company || company.agents.size === 0) {
    return {
      online: false,
      active: false,
      count: 0,
    };
  }
  
  const now = new Date();
  let activeCount = 0;
  
  for (const [_, agent] of company.agents) {
    const minutesSinceActivity = (now.getTime() - agent.lastActivity.getTime()) / (1000 * 60);
    if (minutesSinceActivity < inactivityTimeout) {
      activeCount++;
    }
  }
  
  return {
    online: company.agents.size > 0,
    active: activeCount > 0,
    count: company.agents.size,
  };
}

export function getOnlineAgentsList(companyId: string): Array<{ id: string; name: string; lastActivity: Date }> {
  const company = agentOnlineStatus.get(companyId);
  if (!company) return [];
  
  return Array.from(company.agents.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    lastActivity: data.lastActivity,
  }));
}

// ============================================================
// INTENT DETECTION - EXPORTED
// ============================================================

export function detectIntent(message: string): Intent[] {
  const lower = message.toLowerCase();
  const intents: Intent[] = [];
  
  const patterns: { type: Intent['type']; keywords: string[]; weight: number }[] = [
    { type: 'pricing', keywords: ['pricing', 'price', 'cost', 'how much', 'subscription', 'plan', 'monthly', 'annual', 'fee', 'pay', 'payment'], weight: 1 },
    { type: 'sales', keywords: ['buy', 'purchase', 'subscribe', 'sign up', 'register', 'order', 'trial', 'free trial'], weight: 1 },
    { type: 'demo', keywords: ['demo', 'show', 'demonstration', 'walkthrough', 'tour', 'see how', 'show me'], weight: 1 },
    { type: 'features', keywords: ['feature', 'capability', 'ability', 'can you', 'do you have', 'function', 'option', 'support for'], weight: 0.8 },
    { type: 'technical', keywords: ['api', 'integration', 'code', 'developer', 'technical', 'implement', 'setup', 'config', 'sdk'], weight: 0.9 },
    { type: 'billing', keywords: ['billing', 'invoice', 'payment', 'charge', 'credit card', 'refund', 'cancel', 'upgrade', 'downgrade'], weight: 1 },
    { type: 'support', keywords: ['support', 'help', 'issue', 'problem', 'error', 'broken', 'not working', 'bug', 'fix', 'repair'], weight: 0.9 },
    { type: 'urgent', keywords: ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'quick', 'fast', 'now', 'soon', 'hurry'], weight: 1 },
    { type: 'human', keywords: ['agent', 'human', 'person', 'real person', 'speak to', 'talk to', 'connect me', 'live person'], weight: 1 },
  ];
  
  // Track matched keywords for each intent
  for (const pattern of patterns) {
    const matchedKeywords: string[] = [];
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchedKeywords.length > 0) {
      // Calculate confidence based on number of matches
      const confidence = Math.min(0.5 + (matchedKeywords.length / pattern.keywords.length) * 0.5, 0.95);
      intents.push({
        type: pattern.type,
        confidence: confidence * pattern.weight,
        matchedKeywords,
      });
    }
  }
  
  // If no specific intent detected, mark as general
  if (intents.length === 0) {
    intents.push({
      type: 'general',
      confidence: 0.5,
      matchedKeywords: [],
    });
  }
  
  // Sort by confidence
  intents.sort((a, b) => b.confidence - a.confidence);
  
  // Deduplicate: keep highest confidence per type
  const uniqueIntents = new Map<Intent['type'], Intent>();
  for (const intent of intents) {
    if (!uniqueIntents.has(intent.type) || uniqueIntents.get(intent.type)!.confidence < intent.confidence) {
      uniqueIntents.set(intent.type, intent);
    }
  }
  
  return Array.from(uniqueIntents.values());
}

// ============================================================
// WORKING HOURS CHECK - EXPORTED
// ============================================================

export function isWithinWorkingHours(settings: any): boolean {
  if (!settings.autoReply?.workingHours?.enabled) {
    return true;
  }
  
  const { workingHours } = settings.autoReply;
  const now = new Date();
  
  // Get current time in the company's timezone
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: workingHours.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const currentHour = parseInt(timeString.split(':')[0]);
  const currentMinute = parseInt(timeString.split(':')[1]);
  const currentMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = workingHours.hours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.hours.end.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Check if current day is in working days
  const currentDay = now.getDay();
  if (!workingHours.days.includes(currentDay)) {
    return false;
  }
  
  // Check if current time is within working hours
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// ============================================================
// GENERATE REPLY - EXPORTED
// ============================================================

export function generateReply(intents: Intent[], context: ReplyContext): string {
  const { companySettings } = context;
  
  // Check if user wants to talk to a human
  const wantsHuman = intents.some(i => i.type === 'human');
  if (wantsHuman) {
    if (context.agentOnline) {
      return companySettings.autoReply?.agentOnlineMessage || 
        "👤 I'll connect you with a human agent right away. Please wait a moment...";
    } else {
      return companySettings.autoReply?.agentOfflineMessage || 
        "👤 Our team is currently offline. They'll get back to you within 24 hours. Please leave your message below.";
    }
  }
  
  // Check if urgent
  const isUrgent = intents.some(i => i.type === 'urgent');
  if (isUrgent) {
    if (context.agentOnline) {
      return "🚨 This seems urgent! I'm alerting an agent right now. They'll be with you shortly.";
    } else {
      return "🚨 I understand this is urgent. Our team has been notified and will respond as soon as possible.";
    }
  }
  
  // Priority order for replies
  const priorityOrder: Intent['type'][] = ['pricing', 'sales', 'demo', 'features', 'technical', 'billing', 'support', 'urgent', 'human', 'general'];
  
  // Get the highest priority intent
  const sortedIntents = intents.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.type);
    const bIndex = priorityOrder.indexOf(b.type);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  
  const primaryIntent = sortedIntents[0]?.type || 'general';
  
  // Check for company-specific custom reply
  const customReply = companySettings.autoReply?.customReplies?.find(
    (r: any) => r.intent === primaryIntent && r.enabled
  );
  
  if (customReply) {
    return customReply.reply;
  }
  
  // Default replies
  const defaultReplies: Record<string, string> = {
    pricing: "💰 **Pricing & Plans**\n\nWe offer flexible plans to fit your needs. All plans include:\n• 💬 Live chat widget\n• 🔄 Unlimited conversations\n• 👥 Team collaboration\n• 📊 Analytics & reports\n• 🛡️ 24/7 support\n\nWould you like me to connect you with our sales team for a custom quote?",
    
    sales: "💼 **Ready to get started?**\n\nYou can start with a free trial today! Here's what you get:\n• 14-day free trial\n• All features included\n• No credit card required\n• Cancel anytime",
    
    demo: "🎯 **Schedule a Demo**\n\nI'd love to show you around our platform! Here's how:\n1. Click 'Schedule Demo' above\n2. Pick a time that works for you\n3. Get a personalized walkthrough",
    
    features: "✨ **Key Features**\n\nOur platform includes everything you need:\n• 💬 Live chat widget\n• 🎫 Ticket management\n• 👥 Team collaboration\n• 📊 Analytics dashboard\n• 🤖 Smart auto-replies\n• 📱 Mobile ready\n• 🔌 100+ integrations",
    
    technical: "🔧 **Technical Support**\n\nI can help with:\n• 📚 API documentation\n• 🔗 Integration guides\n• ⚡ Webhook setup\n• 💻 Custom development\n• 🧪 Testing & debugging",
    
    billing: "💳 **Billing & Payments**\n\nCommon billing questions:\n• 💳 We accept all major credit cards\n• 📅 Annual plans get 20% off\n• 🔄 30-day money-back guarantee\n• ⬆️ Upgrade or downgrade anytime",
    
    support: "🆘 **How can I help?**\n\nHere are some ways I can assist:\n• 📚 Check our knowledge base\n• 💬 Chat with me here\n• 📧 Email support@comvia.com\n• 📞 Schedule a call",
    
    urgent: "🚨 **Urgent Support**\n\nI understand this is time-sensitive. Here's what I'll do:\n1. 🔔 Alert our team immediately\n2. 📱 Send you emergency contact info\n3. ⏱️ Follow up within 15 minutes",
    
    human: "👤 **Talk to a Human**\n\nI understand you want to speak with a real person.\n\nIf available, I'll connect you with an agent right away.",
    
    general: "👋 **How can I help you today?**\n\nI'm here to assist with:\n• 💰 Pricing & plans\n• ✨ Features & capabilities\n• 🔧 Technical support\n• 🎯 Demo requests\n• 💳 Billing questions\n• 🔌 Integrations",
  };
  
  return defaultReplies[primaryIntent] || companySettings.autoReply?.fallbackReply || defaultReplies.general;
}

// ============================================================
// MAIN SMART REPLY FUNCTION
// ============================================================

export async function getSmartReply(
  message: string,
  conversationId: string,
  visitorId: string,
  companyId: string,
  io?: SocketServer
): Promise<ReplyResult> {
  try {
    // ============================================================
    // 1. GET COMPANY SETTINGS
    // ============================================================
    
    let companySettings = await CompanySettings.findOne({ companyId });
    
    // If no settings, create default ones
    if (!companySettings) {
      companySettings = await CompanySettings.create({
        companyId,
        autoReply: {
          enabled: true,
          mode: 'agent-offline-only',
          cooldownMinutes: 5,
          maxRepliesPerConversation: 3,
          customReplies: [],
          fallbackReply: '👋 Thanks for your message! Our team will get back to you shortly.',
          agentOnlineMessage: '👤 I\'ll connect you with a human agent right away.',
          agentOfflineMessage: '👤 Our team is currently offline. They\'ll get back to you within 24 hours.',
          workingHours: {
            enabled: false,
            timezone: 'UTC',
            hours: { start: '09:00', end: '17:00' },
            days: [1, 2, 3, 4, 5],
          },
        },
        agentDetection: {
          method: 'both',
          inactivityTimeoutMinutes: 5,
          checkIntervalSeconds: 30,
        },
      });
    }
    
    // ============================================================
    // 2. CHECK IF AUTO-REPLY IS ENABLED
    // ============================================================
    
    if (!companySettings.autoReply?.enabled) {
      return {
        shouldReply: false,
        reason: 'Auto-reply disabled by company settings',
        type: 'none',
      };
    }
    
    // ============================================================
    // 3. GET CONVERSATION CONTEXT
    // ============================================================
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return {
        shouldReply: false,
        reason: 'Conversation not found',
        type: 'none',
      };
    }
    
    // ============================================================
    // 4. CHECK WORKING HOURS
    // ============================================================
    
    if (!isWithinWorkingHours(companySettings)) {
      return {
        shouldReply: false,
        reason: 'Outside working hours',
        type: 'working-hours',
      };
    }
    
    // ============================================================
    // 5. CHECK AGENT AVAILABILITY
    // ============================================================
    
    const agentStatus = getAgentStatus(companyId, companySettings.agentDetection?.inactivityTimeoutMinutes || 5);
    
    // If agent is online and active, check if we should reply
    if (agentStatus.online) {
      // If mode is 'agent-offline-only', don't reply when agent is online
      if (companySettings.autoReply.mode === 'agent-offline-only') {
        if (!agentStatus.active) {
          // Agent is online but inactive - continue with checks
        } else {
          return {
            shouldReply: false,
            reason: 'Agent is online and active',
            type: 'none',
          };
        }
      }
      
      // If mode is 'never', don't reply at all
      if (companySettings.autoReply.mode === 'never') {
        return {
          shouldReply: false,
          reason: 'Auto-reply mode set to never',
          type: 'none',
        };
      }
    }
    
    // ============================================================
    // 6. CHECK COOLDOWN
    // ============================================================
    
    const lastAutoReply = await Message.findOne({
      conversationId,
      senderType: 'system',
    }).sort({ createdAt: -1 });
    
    if (lastAutoReply) {
      const timeSinceLastReply = Date.now() - new Date(lastAutoReply.createdAt).getTime();
      const cooldownMs = (companySettings.autoReply.cooldownMinutes || 5) * 60 * 1000;
      
      if (timeSinceLastReply < cooldownMs) {
        const remainingMinutes = Math.round((cooldownMs - timeSinceLastReply) / 1000 / 60);
        return {
          shouldReply: false,
          reason: `Cooldown active (${remainingMinutes} minutes remaining)`,
          type: 'none',
          metadata: {
            intent: 'cooldown',
            confidence: 1,
          },
        };
      }
    }
    
    // ============================================================
    // 7. CHECK AUTO-REPLY COUNT
    // ============================================================
    
    const autoReplyCount = await Message.countDocuments({
      conversationId,
      senderType: 'system',
    });
    
    const maxReplies = companySettings.autoReply.maxRepliesPerConversation || 3;
    
    if (autoReplyCount >= maxReplies) {
      const intents = detectIntent(message);
      const isUrgentOrHuman = intents.some(i => i.type === 'urgent' || i.type === 'human');
      
      if (!isUrgentOrHuman) {
        return {
          shouldReply: false,
          reason: `Max auto-replies reached (${maxReplies})`,
          type: 'none',
        };
      }
    }
    
    // ============================================================
    // 8. DETECT INTENT
    // ============================================================
    
    const intents = detectIntent(message);
    const primaryIntent = intents[0]?.type || 'general';
    
    // ============================================================
    // 9. CHECK IF THIS IS THE FIRST MESSAGE
    // ============================================================
    
    const messageCount = await Message.countDocuments({
      conversationId,
      senderType: 'visitor',
    });
    
    const isFirstMessage = messageCount <= 1;
    
    // ============================================================
    // 10. GENERATE CONTEXT AND REPLY
    // ============================================================
    
    const context: ReplyContext = {
      conversationId,
      visitorId,
      companyId,
      messageHistory: [],
      agentOnline: agentStatus.online,
      agentActive: agentStatus.active,
      timeSinceLastReply: lastAutoReply ? Date.now() - new Date(lastAutoReply.createdAt).getTime() : Infinity,
      messageCount: autoReplyCount + 1,
      isUrgent: intents.some(i => i.type === 'urgent'),
      isFirstMessage,
      companySettings,
    };
    
    // If it's the first message and agent is online, maybe let agent handle it
    if (isFirstMessage && agentStatus.active) {
      return {
        shouldReply: false,
        reason: 'First message and agent is online',
        type: 'none',
      };
    }
    
    const reply = generateReply(intents, context);
    
    return {
      shouldReply: true,
      reply,
      reason: `Auto-reply for intent: ${primaryIntent} (confidence: ${intents[0]?.confidence || 0})`,
      type: 'auto',
      metadata: {
        intent: primaryIntent,
        confidence: intents[0]?.confidence || 0,
        matchedKeyword: intents[0]?.matchedKeywords?.[0],
      },
    };
    
  } catch (error) {
    console.error('❌ Smart reply error:', error);
    return {
      shouldReply: false,
      reason: 'Error generating reply',
      type: 'none',
    };
  }
}

// ============================================================
// UTILITY: Update agent status via socket events
// ============================================================

export function setupAgentTracking(io: SocketServer): void {
  io.on('connection', (socket) => {
    // When agent joins
    socket.on('join_agents', () => {
      const userId = socket.data.userId || socket.data.user?.id;
      const companyId = socket.data.companyId || socket.data.user?.companyId;
      const name = socket.data.user?.name || 'Agent';
      
      if (userId && companyId) {
        setAgentOnline(companyId, userId, socket.id, name);
        console.log(`👤 Agent ${name} (${userId}) online for company ${companyId}`);
        
        socket.to(`company_${companyId}`).emit('agent_status', {
          agentId: userId,
          name,
          status: 'online',
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    // Track agent activity
    socket.on('agent_activity', () => {
      const userId = socket.data.userId || socket.data.user?.id;
      const companyId = socket.data.companyId || socket.data.user?.companyId;
      
      if (userId && companyId) {
        updateAgentActivity(companyId, userId);
      }
    });
    
    // When agent disconnects
    socket.on('disconnect', () => {
      const userId = socket.data.userId || socket.data.user?.id;
      const companyId = socket.data.companyId || socket.data.user?.companyId;
      
      if (userId && companyId) {
        setAgentOffline(companyId, userId);
        console.log(`👤 Agent ${userId} offline for company ${companyId}`);
      }
    });
  });
}