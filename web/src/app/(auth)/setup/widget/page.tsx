// app/(auth)/setup/widget/page.tsx (Step 2: Widget Setup)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  MessageCircle,
  Mail,
  LifeBuoy,
  HelpCircle,
  Bot,
  Smile,
  User,
  Shield,
  Zap,
  Star,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts";
import { ICON_OPTIONS, POSITIONS, WIDGET_CONSTANTS } from "@/constants/widget";

interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export default function SetupWidgetPage() {
  const router = useRouter();
  const { setupWidget, isLoading: authLoading, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState(user?.widgetSettings?.position || WIDGET_CONSTANTS.DEFAULT_POSITION);
  const [widgetColor, setWidgetColor] = useState(user?.widgetSettings?.color || WIDGET_CONSTANTS.DEFAULT_COLOR);
  const [widgetIcon, setWidgetIcon] = useState(user?.widgetSettings?.icon || WIDGET_CONSTANTS.DEFAULT_ICON);
  const [isLoading, setIsLoading] = useState(false);

  const selectedIcon = ICON_OPTIONS.find(icon => icon.value === widgetIcon);

  const embedCode = `<script>
  window.comviaSettings = {
    position: "${widgetPosition}",
    color: "${widgetColor}",
    icon: "${widgetIcon}"
  };
</script>
<script src="https://cdn.comvia.app/widget.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await setupWidget({
        position: widgetPosition,
        color: widgetColor,
        icon: widgetIcon,
      });
      
      router.push("/setup/branding");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3" />
          Step 2 of 6
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Install the widget</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Add the widget to your website with a single line of code
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4 order-2 md:order-1">
          {/* Widget Position */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Widget Position
            </label>
            <select
              value={widgetPosition}
              onChange={(e) =>
                setWidgetPosition(
                  e.target.value as
                    | "bottom-right"
                    | "bottom-left"
                    | "top-right"
                    | "top-left"
                )
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              aria-label="Select widget position"
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          {/* Widget Color */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Widget Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-800 flex-shrink-0"
                aria-label="Select widget color"
              />
              <input
                type="text"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                aria-label="Enter widget color"
              />
            </div>
          </div>

          {/* Widget Icon */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Widget Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon.value}
                  onClick={() => setWidgetIcon(icon.value)}
                  className={`p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    widgetIcon === icon.value
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                  aria-label={`Select ${icon.label} icon`}
                >
                  <div className={`${widgetIcon === icon.value ? "text-primary" : "text-gray-500"} text-sm sm:text-base`}>
                    {icon.icon}
                  </div>
                  <span className={`text-[10px] sm:text-xs ${
                    widgetIcon === icon.value 
                      ? "text-primary font-medium" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {icon.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Live Preview</p>
            <div className="flex items-center justify-center p-4">
              <div 
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all"
                style={{ backgroundColor: widgetColor }}
              >
                <div className="text-white text-xl sm:text-2xl">
                  {selectedIcon?.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Preview of your widget button
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="order-1 md:order-2">
          <label className="block text-sm font-medium mb-1.5">
            Embed Code
          </label>
          <div className="relative">
            <pre className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-[10px] sm:text-xs overflow-x-auto whitespace-pre-wrap break-all">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-lg bg-background border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Copy embed code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 break-words">
            Paste this code in the <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] sm:text-xs">&lt;head&gt;</code> of your website
          </p>

          {/* Quick tips */}
          <div className="mt-4 p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">💡 Quick Tips</h4>
            <ul className="text-[10px] sm:text-xs space-y-1 text-blue-600 dark:text-blue-300">
              <li className="break-words">• Place the code just before the closing <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-[10px] sm:text-xs">&lt;/head&gt;</code> tag</li>
              <li>• The widget will automatically appear on all pages</li>
              <li>• You can customize these settings later in your dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={isLoading || authLoading}
        className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        {isLoading || authLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            Continue to Branding
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}