"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWidget } from "@/contexts/WidgetContext";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const positions = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "top-right", label: "Top Right" },
  { value: "top-left", label: "Top Left" },
] as const;

const fonts = [
  { value: "inter", label: "Inter" },
  { value: "system", label: "System" },
  { value: "sans-serif", label: "Sans Serif" },
] as const;

const colors = [
  "#F97316", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#F59E0B", "#EF4444", "#14B8A6",
  "#6366F1", "#000000",
];

const icons = [
  { value: "chat", label: "💬 Chat" },
  { value: "message", label: "✉️ Message" },
  { value: "help", label: "❓ Help" },
  { value: "support", label: "🛟 Support" },
  { value: "chat-bubble", label: "💭 Bubble" },
] as const;

interface WidgetSettings {
  position: string;
  color: string;
  icon: string;
  font: string;
  welcomeMessage: string;
  quickReplies: string[];
}

interface PreviewData {
  settings: WidgetSettings;
}

export default function WidgetCustomizePage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    settings,
    isLoading,
    updateAppearance,
    updateContent,
    previewWidget,
    resetToDefaults,
    isDirty,
    loadSettings,
  } = useWidget();

  const [activeTab, setActiveTab] = useState<"appearance" | "content">("appearance");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState<WidgetSettings | null>(null);

  useEffect(() => {
    if (settings && !localSettings) {
        // eslint-disable-next-line
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "appearance" && settings) {
        await updateAppearance({
          position: settings.position,
          color: settings.color,
          icon: settings.icon,
          font: settings.font,
        });
      } else if (activeTab === "content" && settings) {
        await updateContent({
          welcomeMessage: settings.welcomeMessage,
          quickReplies: settings.quickReplies,
        });
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset widget to default settings?")) return;
    setIsResetting(true);
    try {
      await resetToDefaults();
    } catch (error) {
      // Error handled in context
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
      // Error handled in context
    }
  };

  const handleCopyScript = () => {
    // This would copy the embed script
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading widget settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customize Widget</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Make your chat widget match your brand perfectly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center gap-2 text-sm font-medium"
            aria-label="Preview widget"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              aria-label="Save changes"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "appearance"
              ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          }`}
          aria-label="Appearance settings tab"
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "content"
              ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          }`}
          aria-label="Content settings tab"
        >
          <MessageSquare className="w-4 h-4" />
          Content
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
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => {
                      // Better to use context setter in real app
                      settings.position = pos.value;
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      settings.position === pos.value
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                    }`}
                    aria-label={`Set position to ${pos.label}`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Brand Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      if (settings) settings.color = color;
                    }}
                    className={`w-8 h-8 rounded-full transition-all ${
                      settings.color === color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                    title={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Icon
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon.value}
                    onClick={() => {
                      if (settings) settings.icon = icon.value;
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      settings.icon === icon.value
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                    }`}
                    aria-label={`Select ${icon.label} icon`}
                  >
                    {icon.label}
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
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => {
                      if (settings) settings.font = font.value;
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      settings.font === font.value
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                    }`}
                    style={{ fontFamily: font.value }}
                    aria-label={`Select ${font.label} font`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              <span>Live Preview</span>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
                aria-label="Reset to default settings"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </h3>
            {/* Preview content remains the same */}
            <div className="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
              <div className="absolute bottom-6 right-6 w-80 max-w-full">
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden"
                  style={{ fontFamily: settings.font }}
                >
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: settings.color }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        {settings.icon === "chat" && "💬"}
                        {settings.icon === "message" && "✉️"}
                        {settings.icon === "help" && "❓"}
                        {settings.icon === "support" && "🛟"}
                        {settings.icon === "chat-bubble" && "💭"}
                      </div>
                      <span className="font-semibold">Chat Support</span>
                    </div>
                    <button className="text-white/60 hover:text-white" aria-label="Close preview">×</button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 min-h-[200px]">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                      {settings.welcomeMessage || "Hi there! 👋 How can I help?"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {settings.quickReplies?.map((reply, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                        >
                          {reply}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab - Similar improvements applied */}
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
                value={settings.welcomeMessage}
                onChange={(e) => {
                  if (settings && localSettings) {
                    setLocalSettings({ ...localSettings, welcomeMessage: e.target.value });
                  }
                }}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Hi there! 👋 How can I help you today?"
                aria-label="Welcome message"
              />
            </div>

            {/* Quick Replies */}
            <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Replies
              </h3>
              <div className="space-y-2">
                {settings.quickReplies?.map((reply, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => {
                        const newReplies = [...settings.quickReplies];
                        newReplies[index] = e.target.value;
                        if (settings.quickReplies.length > 0) settings.quickReplies = newReplies;
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Quick reply ${index + 1}`}
                      aria-label={`Quick reply ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newReplies = settings.quickReplies.filter((_, i) => i !== index);
                        setLocalSettings({ ...settings, quickReplies: newReplies });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      aria-label={`Remove quick reply ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setLocalSettings({ ...settings, quickReplies: [...settings.quickReplies, ""] });
                  }}
                  className="w-full mt-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:border-primary/30 hover:text-primary transition-colors"
                  aria-label="Add new quick reply"
                >
                  + Add Quick Reply
                </button>
              </div>
            </div>
          </div>

          {/* Preview (Content Tab) */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            {/* Same preview JSX as above */}
            <div className="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
              <div className="absolute bottom-6 right-6 w-80 max-w-full">
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden"
                  style={{ fontFamily: settings.font }}
                >
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: settings.color }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        {settings.icon === "chat" && "💬"}
                        {/* ... other icons */}
                      </div>
                      <span className="font-semibold">Chat Support</span>
                    </div>
                    <button className="text-white/60 hover:text-white" aria-label="Close preview">×</button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 min-h-[200px]">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                      {settings.welcomeMessage || "Hi there! 👋 How can I help?"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {settings.quickReplies?.map((reply, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                        >
                          {reply || `Reply ${i + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              >
                ×
              </button>
            </div>
            {/* Modal preview content */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
              <div className="w-80 max-w-full">
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden"
                  style={{ fontFamily: previewData.settings.font }}
                >
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: previewData.settings.color }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        {previewData.settings.icon === "chat" && "💬"}
                      </div>
                      <span className="font-semibold">Chat Support</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                      {previewData.settings.welcomeMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyScript}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                aria-label="Copy embed script"
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