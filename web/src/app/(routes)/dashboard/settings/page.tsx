"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Mail,
  Lock,
  User,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    companyName: "",
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line
    setFormData({
      companyName: user.companyName || "",
      emailNotifications: true,
      marketingEmails: false,
      twoFactorAuth: false,
    });
  }, [user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ companyName: formData.companyName });
      // Show success toast (handled in context)
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and application settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Settings */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Company Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Your company name"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email updates about conversations and team activity
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) =>
                  setFormData({ ...formData, emailNotifications: e.target.checked })
                }
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive product updates, tips, and promotional content
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.marketingEmails}
                onChange={(e) =>
                  setFormData({ ...formData, marketingEmails: e.target.checked })
                }
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.twoFactorAuth}
                onChange={(e) =>
                  setFormData({ ...formData, twoFactorAuth: e.target.checked })
                }
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}