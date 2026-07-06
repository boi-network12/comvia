// app/(auth)/setup/branding/page.tsx (Step 3: Brand Customization)
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Upload, Sparkles, X, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts";
import { WidgetPreview } from "@/components/Routes/widget/WidgetPreview";

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

  // Get current position from user settings or default
  const widgetPosition = user?.widgetSettings?.position || "bottom-right";
  const widgetIcon = user?.widgetSettings?.icon || "message-circle";

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
        <WidgetPreview
            settings={{
              position: widgetPosition,
              color: brandColor,
              icon: widgetIcon,
              font: font,
              welcomeMessage: welcomeMessage,
              quickReplies: quickReplies
            }}
            companyName={companyName || "Your Company"}
            companyLogo={logo || undefined}
            height="600px"
          />
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