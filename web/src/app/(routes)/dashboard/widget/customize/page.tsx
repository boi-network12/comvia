// app/(routes)/dashboard/widget/customize/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWidget } from "@/contexts/WidgetContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Type,
  MessageSquare,
  Check,
  Loader2,
  Eye,
  Zap,
  Sparkles,
  Copy,
  CheckCircle,
  RotateCcw,
  Save,
  RefreshCw,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Shield,
} from "lucide-react";
import { 
  ICON_OPTIONS, 
  POSITIONS, 
  FONTS, 
  COLORS,
  WIDGET_CONSTANTS,
  getIconByValue 
} from "@/constants/widget";
import { WidgetPreview } from "@/components/Routes/widget/WidgetPreview";

type WidgetPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface WidgetSettings {
  position: WidgetPosition;
  color: string;
  icon: string;
  font: string;
  welcomeMessage: string;
  quickReplies: string[];
}

interface PreviewData {
  settings?: Partial<WidgetSettings>;
  companyName?: string;
  companyLogo?: string;
}

export default function WidgetCustomizePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    settings: contextSettings,
    isLoading: widgetLoading,
    updateAppearance,
    updateContent,
    previewWidget,
    resetToDefaults,
    loadSettings,
    companyName,
    companyLogo,
  } = useWidget();

  const [activeTab, setActiveTab] = useState<"appearance" | "content">("appearance");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState<WidgetSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  // ✅ ADD THIS - Load settings when user is available
  useEffect(() => {
    if (user && !isInitialized && !widgetLoading) {
      loadSettings();
    }
  }, [user, isInitialized, widgetLoading, loadSettings]);

  // Initialize local settings from context
  useEffect(() => {
    if (contextSettings && !isInitialized) {
      // eslint-disable-next-line
      setLocalSettings({
        position: (contextSettings.position as WidgetPosition) || WIDGET_CONSTANTS.DEFAULT_POSITION,
        color: contextSettings.color || WIDGET_CONSTANTS.DEFAULT_COLOR,
        icon: contextSettings.icon || WIDGET_CONSTANTS.DEFAULT_ICON,
        font: contextSettings.font || WIDGET_CONSTANTS.DEFAULT_FONT,
        welcomeMessage: contextSettings.welcomeMessage || WIDGET_CONSTANTS.DEFAULT_WELCOME_MESSAGE,
        quickReplies: contextSettings.quickReplies || WIDGET_CONSTANTS.DEFAULT_QUICK_REPLIES,
      });
      setIsInitialized(true);
      setIsDirty(false);
    }
  }, [contextSettings, isInitialized]);

  // Handle local setting changes
  const updateLocalSetting = useCallback(<K extends keyof WidgetSettings>(
    key: K,
    value: WidgetSettings[K]
  ) => {
    if (!localSettings) return;
    setLocalSettings(prev => {
      if (!prev) return prev;
      const newSettings = { ...prev, [key]: value };
      const hasChanged = JSON.stringify(newSettings) !== JSON.stringify(prev);
      setIsDirty(hasChanged);
      return newSettings;
    });
  }, [localSettings]);

  const handleSave = async () => {
    if (!localSettings) return;
    
    setIsSaving(true);
    try {
      if (activeTab === "appearance") {
        await updateAppearance({
          position: localSettings.position,
          color: localSettings.color,
          icon: localSettings.icon,
          font: localSettings.font,
        });
      } else {
        await updateContent({
          welcomeMessage: localSettings.welcomeMessage,
          quickReplies: localSettings.quickReplies,
        });
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!localSettings) return;
    
    setIsSaving(true);
    try {
      await updateAppearance({
        position: localSettings.position,
        color: localSettings.color,
        icon: localSettings.icon,
        font: localSettings.font,
      });
      
      await updateContent({
        welcomeMessage: localSettings.welcomeMessage,
        quickReplies: localSettings.quickReplies,
      });
      
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save all:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset widget to default settings?")) return;
    setIsResetting(true);
    try {
      await resetToDefaults();
      await loadSettings();
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to reset:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handlePreview = async () => {
    try {
      const data = await previewWidget();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to preview:", error);
    }
  };

  const handleCopyScript = async () => {
    // Get the current settings to generate the embed script
    const settings = {
      position: localSettings?.position || 'bottom-right',
      color: localSettings?.color || '#F97316',
      icon: localSettings?.icon || 'chat',
      companyName: companyName || 'Comvia',
      companyLogo: companyLogo || null,
    };

    // Generate the actual embed script
    const embedScript = `<script>
    (function() {
      var settings = ${JSON.stringify(settings)};
      var script = document.createElement('script');
      script.src = '${process.env.NEXT_PUBLIC_WIDGET_URL || 'https://comvia-widget.vercel.app/comvia-widget.min.js'}';
      script.setAttribute('data-settings', encodeURIComponent(JSON.stringify(settings)));
      document.head.appendChild(script);
    })();
  </script>`;

    try {
      await navigator.clipboard.writeText(embedScript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = embedScript;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleRefresh = async () => {
    await loadSettings();
    setIsDirty(false);
  };

  // Loading state
  if (authLoading || widgetLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {!isInitialized ? "Loading your widget settings..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No widget settings found</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all"
            aria-label="Reload widget settings"
            title="Reload widget settings"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Reload Settings
          </button>
        </div>
      </div>
    );
  }

  const isAppearanceDirty = activeTab === "appearance" && isDirty;
  const isContentDirty = activeTab === "content" && isDirty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customize Widget</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Make your chat widget match your brand perfectly
          </p>
          {companyName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Brand: <span className="font-medium">{companyName}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePreview}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center gap-2 text-sm font-medium"
            aria-label="Preview widget in modal"
            title="Preview widget"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center gap-2 text-sm font-medium"
            aria-label="Refresh widget settings from server"
            title="Refresh settings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isDirty && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              aria-label="Save all widget changes"
              title="Save all changes"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "appearance"
              ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          }`}
          aria-label="Appearance settings tab"
          title="Appearance settings"
        >
          <Palette className="w-4 h-4" />
          Appearance
          {isAppearanceDirty && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "content"
              ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          }`}
          aria-label="Content settings tab"
          title="Content settings"
        >
          <MessageSquare className="w-4 h-4" />
          Content
          {isContentDirty && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Position */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Position
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => updateLocalSetting("position", pos.value)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      localSettings.position === pos.value
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                    }`}
                    aria-label={`Set widget position to ${pos.label}`}
                    title={`Set position to ${pos.label}`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current: {POSITIONS.find(p => p.value === localSettings.position)?.label}
              </p>
            </div>

            {/* Color */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Brand Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateLocalSetting("color", color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      localSettings.color === color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                    title={`Select color ${color}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={localSettings.color}
                  onChange={(e) => updateLocalSetting("color", e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  aria-label="Enter custom color hex value"
                  title="Enter custom color"
                />
                <input
                  type="color"
                  value={localSettings.color}
                  onChange={(e) => updateLocalSetting("color", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800"
                  aria-label="Select color from color picker"
                  title="Select color from picker"
                />
              </div>
            </div>

            {/* Icon */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Icon
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon.value}
                    onClick={() => updateLocalSetting("icon", icon.value)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      localSettings.icon === icon.value
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                    aria-label={`Select ${icon.label} icon`}
                    title={`Select ${icon.label} icon`}
                  >
                    <div className={localSettings.icon === icon.value ? "text-primary" : "text-gray-500"}>
                      {icon.icon}
                    </div>
                    <span className={`text-xs ${
                      localSettings.icon === icon.value 
                        ? "text-primary font-medium" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {icon.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Font
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateLocalSetting("font", font.value)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      localSettings.font === font.value
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                    }`}
                    style={{ fontFamily: font.value }}
                    aria-label={`Select ${font.label} font`}
                    title={`Select ${font.label} font`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Appearance Button */}
            {isAppearanceDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label="Save appearance changes"
                title="Save appearance changes"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Appearance Changes
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              <span>Live Preview</span>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
                aria-label="Reset widget to default settings"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Defaults
              </button>
            </h3>
            
            <WidgetPreview
              settings={localSettings}
              companyName={companyName}
              companyLogo={companyLogo}
              height="600px"
            />
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Welcome Message
              </h3>
              <textarea
                value={localSettings.welcomeMessage}
                onChange={(e) => updateLocalSetting("welcomeMessage", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Hi there! 👋 How can I help you today?"
                aria-label="Welcome message text"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message appears when a visitor opens the chat
              </p>
            </div>

            {/* Quick Replies */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Replies (max 6)
              </h3>
              <div className="space-y-2">
                {localSettings.quickReplies?.map((reply, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => {
                        const newReplies = [...localSettings.quickReplies];
                        newReplies[index] = e.target.value;
                        updateLocalSetting("quickReplies", newReplies);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Quick reply ${index + 1}`}
                      aria-label={`Quick reply ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newReplies = localSettings.quickReplies.filter((_, i) => i !== index);
                        updateLocalSetting("quickReplies", newReplies);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      aria-label={`Remove quick reply ${index + 1}`}
                      title={`Remove quick reply ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {localSettings.quickReplies.length < 6 && (
                  <button
                    onClick={() => {
                      const newReplies = [...localSettings.quickReplies, ""];
                      updateLocalSetting("quickReplies", newReplies);
                    }}
                    className="w-full mt-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:border-primary/30 hover:text-primary transition-colors"
                    aria-label="Add new quick reply"
                    title="Add new quick reply"
                  >
                    + Add Quick Reply
                  </button>
                )}
                {localSettings.quickReplies.length === 6 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Maximum 6 quick replies reached
                  </p>
                )}
              </div>
            </div>

            {/* Save Content Button */}
            {isContentDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label="Save content changes"
                title="Save content changes"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Content Changes
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            
            <WidgetPreview
              settings={localSettings}
              companyName={companyName}
              companyLogo={companyLogo}
              height="600px"
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Widget Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close preview modal"
                title="Close preview"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
              <div className="w-80 max-w-full">
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden"
                  style={{ fontFamily: previewData.settings?.font || "Inter" }}
                >
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: previewData.settings?.color || "#F97316" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        {getIconByValue(previewData.settings?.icon || "chat")}
                      </div>
                      <span className="font-semibold">
                        {previewData.companyName || "Chat Support"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                      {previewData.settings?.welcomeMessage || "Hi there! 👋"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewData.settings?.quickReplies?.map((reply: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                          {reply}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyScript}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                aria-label={copySuccess ? "Embed script copied" : "Copy embed script"}
                title="Copy embed script"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Embed Script
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm"
                aria-label="Close preview and return to customization"
                title="Done"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}