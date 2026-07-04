// app/(auth)/setup/branding/page.tsx (Step 3: Brand Customization)
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Upload, Sparkles, X, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts";

export default function SetupBrandingPage() {
  const router = useRouter();
  const { setupBranding, isLoading: authLoading, user } = useAuth();
  
  // Initialize with user data if available
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [brandColor, setBrandColor] = useState(user?.widgetSettings?.color || "#F97316");
  const [logo, setLogo] = useState<string | null>(user?.companyLogo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [font, setFont] = useState(user?.widgetSettings?.font || "inter");
  const [welcomeMessage, setWelcomeMessage] = useState(
    user?.widgetSettings?.welcomeMessage || "Hi there! 👋 How can I help you today?"
  );
  const [quickReplies, setQuickReplies] = useState(
    user?.widgetSettings?.quickReplies || ["Pricing", "Features", "Support", "Demo"]
  );
  const [newReply, setNewReply] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuickReply = () => {
    if (newReply.trim() && quickReplies.length < 6) {
      setQuickReplies([...quickReplies, newReply.trim()]);
      setNewReply("");
    }
  };

  const removeQuickReply = (index: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  };

  type BrandingData = {
    companyName: string;
    brandColor: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
    logo?: File;
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Prepare the data for API
      const brandingData: BrandingData = {
        companyName: companyName || "My Company",
        brandColor: brandColor,
        font: font,
        welcomeMessage: welcomeMessage,
        quickReplies: quickReplies,
      };

      // Add logo file if uploaded
      if (logoFile) {
        brandingData.logo = logoFile;
      }

      await setupBranding(brandingData);
      router.push("/setup/team");
    } catch (error) {
      console.error("Error saving branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3" />
          Step 3 of 6
        </div>
        <h1 className="text-2xl font-bold">Customize your brand</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Make the widget look and feel like your brand
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-800"
                aria-label="Select brand color"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Enter brand color"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This color will be used across your widget and dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Font Family
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Select font family"
            >
              <option value="inter">Inter</option>
              <option value="system">System Default</option>
              <option value="geist">Geist</option>
              <option value="roboto">Roboto</option>
              <option value="open-sans">Open Sans</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Logo
            </label>
            <div className="relative">
              {logo ? (
                <div className="relative w-32 h-32 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <Image
                    src={logo}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() => {
                      setLogo(null);
                      setLogoFile(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    aria-label="Remove logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload Logo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Square image, PNG or JPG, max 5MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Welcome Message
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Enter your welcome message..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Quick Replies (max 6)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addQuickReply()}
                placeholder="Add quick reply..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={quickReplies.length >= 6}
              />
              <button
                onClick={addQuickReply}
                disabled={!newReply.trim() || quickReplies.length >= 6}
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                >
                  {reply}
                  <button
                    onClick={() => removeQuickReply(index)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove quick reply ${reply}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Live Preview
          </label>
          <div className="relative h-[600px] rounded-xl bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Mock Website Background */}
            <div className="p-6 h-full bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-6">
                {logo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative">
                    <Image src={logo} alt="Logo" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brandColor }} />
                )}
                <span className="font-semibold" style={{ 
                  fontFamily: font === 'inter' ? 'Inter' : 
                             font === 'system' ? 'system-ui' :
                             font === 'geist' ? 'Geist' :
                             font === 'roboto' ? 'Roboto' :
                             font === 'open-sans' ? 'Open Sans' : 'Inter'
                }}>
                  {companyName || "Your Company"}
                </span>
              </div>
              
              {/* Mock Content */}
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-5/6 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4/6 rounded-lg bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Widget Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: brandColor }}
              aria-label="Open chat widget"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>

            {/* Chat Window */}
            {isChatOpen && (
              <div 
                className="absolute bottom-24 right-6 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                style={{ fontFamily: font === 'inter' ? 'Inter' : 
                         font === 'system' ? 'system-ui' :
                         font === 'geist' ? 'Geist' :
                         font === 'roboto' ? 'Roboto' :
                         font === 'open-sans' ? 'Open Sans' : 'Inter' }}
              >
                {/* Chat Header */}
                <div className="p-4 text-white" style={{ backgroundColor: brandColor }}>
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden relative border-2 border-white/20">
                        <Image src={logo} alt="Logo" fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {companyName?.charAt(0).toUpperCase() || "C"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{companyName || "Your Company"}</p>
                      <p className="text-xs opacity-80">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-start gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandColor }}>
                      <span className="text-white text-xs font-bold">
                        {companyName?.charAt(0).toUpperCase() || "C"}
                      </span>
                    </div>
                    <div className="max-w-[80%]">
                      <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-sm">{welcomeMessage}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Replies */}
                  {quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-opacity-10"
                          style={{ 
                            borderColor: brandColor,
                            color: brandColor,
                            backgroundColor: `${brandColor}10`
                          }}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ 
                        '--tw-ring-color': brandColor,
                      } as React.CSSProperties}
                    />
                    <button
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: brandColor }}
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={isLoading || authLoading}
        className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || authLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            Continue to Team Setup
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}