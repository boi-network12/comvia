// app/(routes)/dashboard/widget/smart-reply/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartReply } from "@/contexts/SmartReplyContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Clock,
  MessageSquare,
  Loader2,
  Eye,
  Sparkles,
  Save,
  RefreshCw,
  X,
  Plus,
  Trash2,
  Edit2,
  Power,
  Calendar,
  Settings,
  Activity,
  AlertCircle,
  UserCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { INTENT_OPTIONS, INTENT_LABELS, INTENT_ICONS } from "@/constants/smartReply";
import AgentStatusBadge from "@/components/static/AgentStatusBadge";
import type { CustomReply } from "@/services/smartReply";

// ============================================================
// TYPES
// ============================================================

type SmartReplyIntent = (typeof INTENT_OPTIONS)[number]["value"];
type AutoReplyMode = "smart" | "always" | "never" | "agent-offline-only";
type DetectionMethod = "socket" | "lastActivity" | "both";

// ============================================================
// COMPONENTS
// ============================================================

const ModeSelector = ({ 
  value, 
  onChange 
}: { 
  value: AutoReplyMode; 
  onChange: (value: AutoReplyMode) => void;
}) => {
  const modes: { value: AutoReplyMode; label: string; description: string }[] = [
    { value: 'smart', label: 'Smart', description: 'AI-powered replies based on intent detection' },
    { value: 'agent-offline-only', label: 'Agent Offline Only', description: 'Only reply when no agents are online' },
    { value: 'always', label: 'Always', description: 'Reply to every message (not recommended)' },
    { value: 'never', label: 'Never', description: 'Disable auto-replies completely' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            value === mode.value
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${value === mode.value ? 'bg-primary' : 'bg-gray-300'}`} />
            <span className="font-medium">{mode.label}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
        </button>
      ))}
    </div>
  );
};

const DaySelector = ({ 
  days, 
  onChange 
}: { 
  days: number[]; 
  onChange: (days: number[]) => void;
}) => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const toggleDay = (index: number) => {
    if (days.includes(index)) {
      onChange(days.filter(d => d !== index));
    } else {
      onChange([...days, index].sort());
    }
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {dayLabels.map((label, index) => (
        <button
          key={index}
          onClick={() => toggleDay(index)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            days.includes(index)
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const IntentBadge = ({ 
  intent, 
  onEdit, 
  onToggle, 
  onDelete, 
  reply, 
  enabled 
}: {
  intent: string;
  reply: string;
  enabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const Icon = INTENT_ICONS[intent as keyof typeof INTENT_ICONS] || MessageSquare;
  const label = INTENT_LABELS[intent as keyof typeof INTENT_LABELS] || intent;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      enabled ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200 dark:border-gray-800 opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{reply}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={enabled ? 'Disable' : 'Enable'}
          >
            {enabled ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function SmartReplyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    autoReply,
    agentDetection,
    isLoading,
    isDirty,
    onlineAgents,
    updateAutoReply,
    updateAgentDetection,
    resetAutoReply,
    testReply,
    refreshOnlineAgents,
    addCustomReply,
    removeCustomReply,
    updateCustomReply,
  } = useSmartReply();

  const [activeTab, setActiveTab] = useState<'general' | 'custom' | 'advanced'>('general');
  const [editingIntent, setEditingIntent] = useState<string | null>(null);
  const [editReply, setEditReply] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newIntent, setNewIntent] = useState<SmartReplyIntent | ''>('');
  const [newReply, setNewReply] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<{ reply: string; intent: string; confidence: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Auto-refresh online agents every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshOnlineAgents, 30000);
    return () => clearInterval(interval);
  }, [refreshOnlineAgents]);

  if (authLoading || isLoading || !autoReply) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading smart reply settings...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save general settings
      await updateAutoReply({
        enabled: autoReply.enabled,
        mode: autoReply.mode,
        cooldownMinutes: autoReply.cooldownMinutes,
        maxRepliesPerConversation: autoReply.maxRepliesPerConversation,
        fallbackReply: autoReply.fallbackReply,
        agentOnlineMessage: autoReply.agentOnlineMessage,
        agentOfflineMessage: autoReply.agentOfflineMessage,
        workingHours: autoReply.workingHours,
      });
      
      if (agentDetection) {
        await updateAgentDetection({
          method: agentDetection.method,
          inactivityTimeoutMinutes: agentDetection.inactivityTimeoutMinutes,
          checkIntervalSeconds: agentDetection.checkIntervalSeconds,
        });
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestReply = async () => {
    if (!testMessage.trim()) return;
    setIsTesting(true);
    try {
      const result = await testReply(testMessage);
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddCustomReply = async () => {
    if (!newIntent || !newReply) return;
    
    const customReply: CustomReply = {
      intent: newIntent as CustomReply['intent'],
      reply: newReply,
      enabled: true,
    };
    
    await addCustomReply(customReply);
    setShowAddCustom(false);
    setNewIntent('');
    setNewReply('');
  };

  const handleEditCustomReply = async (intent: string) => {
    if (!editReply) return;
    await updateCustomReply(intent, editReply, true);
    setEditingIntent(null);
    setEditReply('');
  };

  const handleModeChange = (mode: string) => {
    updateAutoReply({ mode: mode as AutoReplyMode });
  };

  const handleMethodChange = (method: string) => {
    updateAgentDetection({ method: method as DetectionMethod });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Smart Reply Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure intelligent auto-replies for your chat widget
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AgentStatusBadge 
            onlineAgents={onlineAgents}
            refreshOnlineAgents={refreshOnlineAgents}
          />
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-foreground'
              : 'text-gray-500 dark:text-gray-400 hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-foreground'
              : 'text-gray-500 dark:text-gray-400 hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Custom Replies
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'advanced'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-foreground'
              : 'text-gray-500 dark:text-gray-400 hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          Advanced
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Enable/Disable */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Power className={`w-5 h-5 ${autoReply.enabled ? 'text-primary' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="font-semibold">Auto-Reply</h3>
                    <p className="text-sm text-gray-500">
                      {autoReply.enabled ? 'Smart replies are active' : 'Auto-replies are disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateAutoReply({ enabled: !autoReply.enabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoReply.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoReply.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Mode */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Reply Mode
              </h3>
              <ModeSelector
                value={autoReply.mode}
                onChange={handleModeChange}
              />
            </div>

            {/* Cooldown & Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Cooldown
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={autoReply.cooldownMinutes}
                    onChange={(e) => updateAutoReply({ cooldownMinutes: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-gray-500">minutes between replies</span>
                </div>
              </div>

              <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Max Replies
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={autoReply.maxRepliesPerConversation}
                    onChange={(e) => updateAutoReply({ maxRepliesPerConversation: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-gray-500">replies per conversation</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Working Hours
                </h3>
                <button
                  onClick={() => updateAutoReply({
                    workingHours: {
                      ...autoReply.workingHours,
                      enabled: !autoReply.workingHours.enabled,
                    }
                  })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    autoReply.workingHours.enabled
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {autoReply.workingHours.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {autoReply.workingHours.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Start Time</label>
                      <input
                        type="time"
                        value={autoReply.workingHours.hours.start}
                        onChange={(e) => updateAutoReply({
                          workingHours: {
                            ...autoReply.workingHours,
                            hours: { ...autoReply.workingHours.hours, start: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">End Time</label>
                      <input
                        type="time"
                        value={autoReply.workingHours.hours.end}
                        onChange={(e) => updateAutoReply({
                          workingHours: {
                            ...autoReply.workingHours,
                            hours: { ...autoReply.workingHours.hours, end: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Timezone</label>
                      <input
                        type="text"
                        value={autoReply.workingHours.timezone}
                        onChange={(e) => updateAutoReply({
                          workingHours: {
                            ...autoReply.workingHours,
                            timezone: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="UTC"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Working Days</label>
                    <DaySelector
                      days={autoReply.workingHours.days}
                      onChange={(days) => updateAutoReply({
                        workingHours: {
                          ...autoReply.workingHours,
                          days
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Test Message */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Test Your Reply
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a test message..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleTestReply()}
                />
                <button
                  onClick={handleTestReply}
                  disabled={isTesting || !testMessage.trim()}
                  className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Test
                    </>
                  )}
                </button>
              </div>
              {testResult && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Intent:</span>
                        <span className="text-sm px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {INTENT_LABELS[testResult.intent as keyof typeof INTENT_LABELS] || testResult.intent}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(testResult.confidence * 100).toFixed(0)}% confidence)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {testResult.reply}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Custom Reply */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Custom Reply
              </button>
              {showAddCustom && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Intent</label>
                      <select
                        value={newIntent}
                        onChange={(e) => setNewIntent(e.target.value as SmartReplyIntent)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select Intent</option>
                        {INTENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Reply Message</label>
                      <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Your custom reply..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustomReply}
                      disabled={!newIntent || !newReply}
                      className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm"
                    >
                      Add Reply
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCustom(false);
                        setNewIntent('');
                        setNewReply('');
                      }}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Replies List */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Custom Replies ({autoReply.customReplies.length})
              </h3>
              <div className="space-y-3">
                {autoReply.customReplies.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No custom replies configured. Add one above.
                  </p>
                ) : (
                  autoReply.customReplies.map((reply) => (
                    <IntentBadge
                      key={reply.intent}
                      intent={reply.intent}
                      reply={reply.reply}
                      enabled={reply.enabled}
                      onEdit={() => {
                        setEditingIntent(reply.intent);
                        setEditReply(reply.reply);
                      }}
                      onToggle={() => updateCustomReply(reply.intent, reply.reply, !reply.enabled)}
                      onDelete={() => removeCustomReply(reply.intent)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Edit Modal */}
            {editingIntent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-background rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Edit Reply</h3>
                    <button
                      onClick={() => {
                        setEditingIntent(null);
                        setEditReply('');
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Intent</label>
                      <p className="text-sm text-gray-500">
                        {INTENT_LABELS[editingIntent as keyof typeof INTENT_LABELS] || editingIntent}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reply Message</label>
                      <textarea
                        value={editReply}
                        onChange={(e) => setEditReply(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCustomReply(editingIntent)}
                        disabled={!editReply}
                        className="flex-1 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingIntent(null);
                          setEditReply('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'advanced' && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Agent Detection */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                Agent Detection
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Detection Method</label>
                  <select
                    value={agentDetection?.method || 'both'}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="socket">Socket Connection Only</option>
                    <option value="lastActivity">Last Activity Only</option>
                    <option value="both">Both (Recommended)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Inactivity Timeout</label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={agentDetection?.inactivityTimeoutMinutes || 5}
                      onChange={(e) => updateAgentDetection({ inactivityTimeoutMinutes: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm text-gray-500">minutes of inactivity</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Check Interval</label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={agentDetection?.checkIntervalSeconds || 30}
                      onChange={(e) => updateAgentDetection({ checkIntervalSeconds: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm text-gray-500">seconds between checks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fallback Messages */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Fallback Messages
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Fallback Reply</label>
                  <textarea
                    value={autoReply.fallbackReply}
                    onChange={(e) => updateAutoReply({ fallbackReply: e.target.value })}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Agent Online Message</label>
                  <textarea
                    value={autoReply.agentOnlineMessage}
                    onChange={(e) => updateAutoReply({ agentOnlineMessage: e.target.value })}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Agent Offline Message</label>
                  <textarea
                    value={autoReply.agentOfflineMessage}
                    onChange={(e) => updateAutoReply({ agentOfflineMessage: e.target.value })}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="bg-background border border-red-200/50 dark:border-red-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Reset to Defaults
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This will reset all auto-reply settings to their default values. This action cannot be undone.
              </p>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to reset all auto-reply settings?')) {
                    await resetAutoReply();
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm"
              >
                Reset Everything
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}