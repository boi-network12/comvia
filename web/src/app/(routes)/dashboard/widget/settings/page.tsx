"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWidget } from "@/contexts/WidgetContext";
import { useRouter } from "next/navigation";
import {
  Code,
  Copy,
  CheckCircle,
  Loader2,
  Globe,
  RefreshCw,
  AlertCircle,
  Key,
} from "lucide-react";

export default function WidgetSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { embedScript, getEmbedScript, isLoading, settings, companyName, companyLogo } = useWidget();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      await getEmbedScript();
    } catch (error) {
      console.error("Failed to generate script:", error);
    } finally {
      setIsGenerating(false);
    }
  };


  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Load embed script if not loaded
    if (!embedScript) {
        // eslint-disable-next-line
      generateScript();
    }
  }, [user, router]);

  
  const handleCopy = async () => {
    if (!embedScript) return;
    try {
      await navigator.clipboard.writeText(embedScript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Generating embed code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Widget Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Embed the widget on your website with one line of code
          </p>
        </div>
        <button
          onClick={generateScript}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm font-medium disabled:opacity-50 "
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* Company ID Card - ✅ NEW */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-3">
        <Key className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Your Company ID
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
            {user?._id || 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(user?._id || '');
            // Show a quick feedback
          }}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Copy
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Widget is ready to deploy
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Copy the code below and paste it into your website&apos;s HTML before the closing {`</body>`} tag.
          </p>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Embed Code</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <div className="p-4 bg-gray-950/5 dark:bg-gray-950/20 overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
            {embedScript || "<!-- No script generated yet -->"}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Installation Instructions
        </h3>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-medium">Copy the embed code</p>
              <p className="text-gray-500 dark:text-gray-400">
                Click the &quot;Copy Code&quot; button above to copy the widget script.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-medium">Paste into your website</p>
              <p className="text-gray-500 dark:text-gray-400">
                Paste the code just before the closing {`</body>`} tag of your HTML.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-medium">Customize the widget</p>
              <p className="text-gray-500 dark:text-gray-400">
                Go to the <strong>Customize</strong> tab to change colors, position, and content.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Configuration Summary */}
      {settings && (
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Current Configuration</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Position</dt>
              <dd className="font-medium capitalize">{settings.position.replace("-", " ")}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Brand Color</dt>
              <dd className="font-medium flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: settings.color }}
                />
                {settings.color}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Icon</dt>
              <dd className="font-medium capitalize">{settings.icon}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Font</dt>
              <dd className="font-medium capitalize">{settings.font}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Welcome Message</dt>
              <dd className="font-medium">{settings.welcomeMessage}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}