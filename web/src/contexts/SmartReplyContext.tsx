// web/contexts/SmartReplyContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { smartReplyAPI, AutoReplySettings, AgentDetectionSettings, CompanySettings, UpdateAutoReplyData, UpdateAgentDetectionData, CustomReply } from '@/services/smartReply';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useErrorHandler } from '@/utils/error-handler';

interface SmartReplyContextType {
  settings: CompanySettings | null;
  autoReply: AutoReplySettings | null;
  agentDetection: AgentDetectionSettings | null;
  isLoading: boolean;
  isDirty: boolean;
  onlineAgents: {
    online: boolean;
    active: boolean;
    count: number;
    agents: Array<{ id: string; name: string; lastActivity: string }>;
  } | null;
  
  loadSettings: () => Promise<void>;
  updateAutoReply: (data: UpdateAutoReplyData) => Promise<void>;
  updateAgentDetection: (data: UpdateAgentDetectionData) => Promise<void>;
  resetAutoReply: () => Promise<void>;
  testReply: (message: string) => Promise<{ reply: string; intent: string; confidence: number } | null>;
  refreshOnlineAgents: () => Promise<void>;
  updateCustomReply: (intent: string, reply: string, enabled: boolean) => Promise<void>;
  addCustomReply: (reply: CustomReply) => Promise<void>;
  removeCustomReply: (intent: string) => Promise<void>;
}

const SmartReplyContext = createContext<SmartReplyContextType | undefined>(undefined);

export function SmartReplyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [autoReply, setAutoReply] = useState<AutoReplySettings | null>(null);
  const [agentDetection, setAgentDetection] = useState<AgentDetectionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<SmartReplyContextType['onlineAgents']>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // ==================== LOAD SETTINGS ====================
  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await smartReplyAPI.getSettings();
      const data = response.data;
      setSettings(data);
      setAutoReply(data.autoReply);
      setAgentDetection(data.agentDetection);
      setIsDirty(false);
    } catch (error) {
      handleError(error, 'Failed to load smart reply settings');
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  // ==================== UPDATE AUTO-REPLY ====================
  const updateAutoReply = useCallback(async (data: UpdateAutoReplyData) => {
    setIsLoading(true);
    try {
      const response = await smartReplyAPI.updateAutoReply(data);
      setAutoReply(response.data);
      setSettings(prev => prev ? { ...prev, autoReply: response.data } : null);
      setIsDirty(true);
      showSuccess('Auto-reply settings updated!');
    } catch (error) {
      handleError(error, 'Failed to update auto-reply settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  // ==================== UPDATE AGENT DETECTION ====================
  const updateAgentDetection = useCallback(async (data: UpdateAgentDetectionData) => {
    setIsLoading(true);
    try {
      const response = await smartReplyAPI.updateAgentDetection(data);
      setAgentDetection(response.data);
      setSettings(prev => prev ? { ...prev, agentDetection: response.data } : null);
      setIsDirty(true);
      showSuccess('Agent detection settings updated!');
    } catch (error) {
      handleError(error, 'Failed to update agent detection settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  // ==================== RESET AUTO-REPLY ====================
  const resetAutoReply = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await smartReplyAPI.resetAutoReply();
      setAutoReply(response.data);
      setSettings(prev => prev ? { ...prev, autoReply: response.data } : null);
      setIsDirty(true);
      showSuccess('Auto-reply reset to defaults!');
    } catch (error) {
      handleError(error, 'Failed to reset auto-reply');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  // ==================== TEST REPLY ====================
  const testReply = useCallback(async (message: string) => {
    try {
      const response = await smartReplyAPI.testReply(message);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to test reply');
      return null;
    }
  }, [handleError]);

  // ==================== REFRESH ONLINE AGENTS ====================
  const refreshOnlineAgents = useCallback(async () => {
    try {
      const response = await smartReplyAPI.getOnlineAgents();
      setOnlineAgents(response.data);
    } catch (error) {
      console.error('Failed to get online agents:', error);
    }
  }, []);

  // ==================== CUSTOM REPLY MANAGEMENT ====================
  const updateCustomReply = useCallback(async (intent: string, reply: string, enabled: boolean) => {
    if (!autoReply) return;
    
    const updatedReplies = autoReply.customReplies.map(r => 
      r.intent === intent ? { ...r, reply, enabled } : r
    );
    
    await updateAutoReply({ customReplies: updatedReplies });
  }, [autoReply, updateAutoReply]);

  const addCustomReply = useCallback(async (reply: CustomReply) => {
    if (!autoReply) return;
    
    const exists = autoReply.customReplies.some(r => r.intent === reply.intent);
    if (exists) {
      // Update existing
      await updateCustomReply(reply.intent, reply.reply, reply.enabled);
      return;
    }
    
    const updatedReplies = [...autoReply.customReplies, reply];
    await updateAutoReply({ customReplies: updatedReplies });
  }, [autoReply, updateAutoReply, updateCustomReply]);

  const removeCustomReply = useCallback(async (intent: string) => {
    if (!autoReply) return;
    
    const updatedReplies = autoReply.customReplies.filter(r => r.intent !== intent);
    await updateAutoReply({ customReplies: updatedReplies });
  }, [autoReply, updateAutoReply]);

  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    if (!user || hasInitialized) return;
    // eslint-disable-next-line
    loadSettings();
    refreshOnlineAgents();
    setHasInitialized(true);
    
    // Refresh online agents every 30 seconds
    const interval = setInterval(refreshOnlineAgents, 30000);
    return () => clearInterval(interval);
  }, [user, loadSettings, refreshOnlineAgents, hasInitialized]);

  // ==================== CONTEXT VALUE ====================
  const contextValue = useMemo(() => ({
    settings,
    autoReply,
    agentDetection,
    isLoading,
    isDirty,
    onlineAgents,
    loadSettings,
    updateAutoReply,
    updateAgentDetection,
    resetAutoReply,
    testReply,
    refreshOnlineAgents,
    updateCustomReply,
    addCustomReply,
    removeCustomReply,
  }), [
    settings,
    autoReply,
    agentDetection,
    isLoading,
    isDirty,
    onlineAgents,
    loadSettings,
    updateAutoReply,
    updateAgentDetection,
    resetAutoReply,
    testReply,
    refreshOnlineAgents,
    updateCustomReply,
    addCustomReply,
    removeCustomReply,
  ]);

  return (
    <SmartReplyContext.Provider value={contextValue}>
      {children}
    </SmartReplyContext.Provider>
  );
}

export function useSmartReply() {
  const context = useContext(SmartReplyContext);
  if (context === undefined) {
    throw new Error('useSmartReply must be used within a SmartReplyProvider');
  }
  return context;
}