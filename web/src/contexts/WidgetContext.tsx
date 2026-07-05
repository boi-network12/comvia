"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { widgetAPI, WidgetSettings, WidgetAppearanceData, WidgetContentData } from '@/services/widget';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useErrorHandler } from '@/utils/error-handler';

interface WidgetContextType {
  settings: WidgetSettings | null;
  companyName: string;
  companyLogo?: string;
  embedScript: string;
  isLoading: boolean;
  isDirty: boolean;
  
  loadSettings: () => Promise<void>;
  updateAppearance: (data: WidgetAppearanceData) => Promise<void>;
  updateContent: (data: WidgetContentData) => Promise<void>;
  getEmbedScript: () => Promise<string>;
  previewWidget: () => Promise<{ settings: WidgetSettings; companyName: string; companyLogo?: string }>;
  resetToDefaults: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler();

  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | undefined>();
  const [embedScript, setEmbedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // ==================== STABLE CALLBACKS ====================

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await widgetAPI.getSettings();
      const { widgetSettings, companyName: company, companyLogo: logo } = response.data;
      
      setSettings(widgetSettings);
      setCompanyName(company);
      setCompanyLogo(logo);
      setIsDirty(false);
    } catch (error) {
      handleError(error, 'Failed to load widget settings');
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  const getEmbedScript = useCallback(async () => {
    try {
      const response = await widgetAPI.getEmbedScript();
      const script = response.data.script;
      setEmbedScript(script);
      return script;
    } catch (error) {
      handleError(error, 'Failed to generate embed script');
      throw error;
    }
  }, [handleError]);

  const updateAppearance = useCallback(async (data: WidgetAppearanceData) => {
    setIsLoading(true);
    try {
      const response = await widgetAPI.updateAppearance(data);
      setSettings(response.data);
      setIsDirty(true);
      showSuccess('Widget appearance updated!');
    } catch (error) {
      handleError(error, 'Failed to update widget appearance');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const updateContent = useCallback(async (data: WidgetContentData) => {
    setIsLoading(true);
    try {
      const response = await widgetAPI.updateContent(data);
      setSettings(response.data);
      setIsDirty(true);
      showSuccess('Widget content updated!');
    } catch (error) {
      handleError(error, 'Failed to update widget content');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const previewWidget = useCallback(async () => {
    try {
      const response = await widgetAPI.getPreview();
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to preview widget');
      throw error;
    }
  }, [handleError]);

  const resetToDefaults = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await widgetAPI.resetToDefaults();
      setSettings(response.data);
      setIsDirty(false);
      showSuccess('Widget reset to defaults');
    } catch (error) {
      handleError(error, 'Failed to reset widget');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  // ==================== INITIAL LOAD (ONCE) ====================
  useEffect(() => {
    if (!user || hasInitialized) return;

    // eslint-disable-next-line
    loadSettings();
    getEmbedScript();           // Only call once on mount
    setHasInitialized(true);

  }, [user, loadSettings, getEmbedScript, hasInitialized]);

  // Optional: Refresh when user changes (rare case)
  useEffect(() => {
  if (!user || hasInitialized) return;
  // eslint-disable-next-line
    loadSettings();
    getEmbedScript();
    setHasInitialized(true);
  }, [user, loadSettings, getEmbedScript, hasInitialized]);

  const contextValue = useMemo(() => ({
    settings,
    companyName,
    companyLogo,
    embedScript,
    isLoading,
    isDirty,
    loadSettings,
    updateAppearance,
    updateContent,
    getEmbedScript,
    previewWidget,
    resetToDefaults,
  }), [
    settings,
    companyName,
    companyLogo,
    embedScript,
    isLoading,
    isDirty,
    loadSettings,
    updateAppearance,
    updateContent,
    getEmbedScript,
    previewWidget,
    resetToDefaults,
  ]);

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}