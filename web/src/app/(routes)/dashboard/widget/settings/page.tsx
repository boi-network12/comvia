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
  Key,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function WidgetSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    embedScript, 
    vanillaScript, 
    getEmbedScript, 
    isLoading, 
    settings, 
  } = useWidget();
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVanilla, setShowVanilla] = useState(false);

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
    if (!embedScript) {
      // eslint-disable-next-line
      generateScript();
    }
  }, [user, router]);

  const handleCopy = async () => {
    const scriptToCopy = showVanilla ? vanillaScript : embedScript;
    if (!scriptToCopy) return;
    try {
      await navigator.clipboard.writeText(scriptToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const currentScript = showVanilla ? vanillaScript : embedScript;

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
    <div className="space-y-6 max-w-full">
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm font-medium disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* Company ID Card */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-3">
        <Key className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Your Company ID
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
            {user?.companyId || 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(user?._id || '');
          }}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex-shrink-0"
        >
          Copy
        </button>
      </div>

      {/* Toggle between script types */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Script Type</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {showVanilla 
              ? "Vanilla JS - works with any website" 
              : "Next.js - optimized for Next.js apps"}
          </p>
        </div>
        <button
          onClick={() => setShowVanilla(!showVanilla)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          {showVanilla ? (
            <>
              <ToggleLeft className="w-5 h-5" />
              <span>Use Next.js Version</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-5 h-5" />
              <span>Use Vanilla JS</span>
            </>
          )}
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-start sm:items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Widget is ready to deploy
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {showVanilla 
              ? "Copy the code below and paste it into your website's HTML before the closing </body> tag."
              : "Copy the component below and add it to your Next.js layout file."}
          </p>
        </div>
      </div>

      {/* Embed Code with improved overflow handling */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Code className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {showVanilla ? "Vanilla JS Code" : "Next.js Component"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0">
              {showVanilla ? "JavaScript" : "TSX"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium flex-shrink-0 w-full sm:w-auto justify-center"
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
        
        {/* Code display with better overflow handling */}
        <div className="relative">
          <div className="p-4 overflow-x-auto max-w-full">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words font-mono">
              <code className="block max-w-full">
                {currentScript || "<!-- No script generated yet -->"}
              </code>
            </pre>
          </div>
          
          {/* Optional: Show line count */}
          {currentScript && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-xs text-gray-400">
              {currentScript.split('\n').length} lines
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary flex-shrink-0" />
          Installation Instructions
        </h3>
        {showVanilla ? (
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div className="min-w-0">
                <p className="font-medium">Copy the embed code</p>
                <p className="text-gray-500 dark:text-gray-400 break-words">
                  Click the &quot;Copy Code&quot; button above to copy the widget script.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div className="min-w-0">
                <p className="font-medium">Paste into your website</p>
                <p className="text-gray-500 dark:text-gray-400 break-words">
                  Paste the code just before the closing <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">&lt;/body&gt;</code> tag of your HTML.
                </p>
              </div>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div className="min-w-0">
                <p className="font-medium">Copy the component</p>
                <p className="text-gray-500 dark:text-gray-400 break-words">
                  Click the &quot;Copy Code&quot; button above to copy the WidgetLoader component.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div className="min-w-0">
                <p className="font-medium">Add to your layout</p>
                <p className="text-gray-500 dark:text-gray-400 break-words">
                  Create a new file <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">components/WidgetLoader.tsx</code> and paste the code.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <div className="min-w-0">
                <p className="font-medium">Import in your layout</p>
                <p className="text-gray-500 dark:text-gray-400 break-words">
                  Add <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">{`<WidgetLoader companyId="${user?.companyId || 'YOUR_COMPANY_ID'}" />`}</code> to your root layout.
                </p>
              </div>
            </li>
          </ol>
        )}
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
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: settings.color }}
                />
                <span className="break-all">{settings.color}</span>
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
              <dd className="font-medium break-words">{settings.welcomeMessage}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}