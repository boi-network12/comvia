// app/(routes)/profile/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import {
  User,
  Mail,
  Shield,
  Bell,
  Key,
  Globe,
  Palette,
  Save,
  Camera,
  X,
  Check,
  Loader2,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  Building2,
  Link as LinkIcon,
  Smartphone,
  Clock,
  Award,
  Star,
  Users,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/contexts";

export default function ProfilePage() {
  const { user, updateProfile, logout, isLoading: authLoading, refreshUser } = useAuth();
  const { stats: conversationStats, loadStats } = useConversation();
  const { members, loadMembers } = useTeam();
  const { resolutionRate, totalConversations, totalConversations: resolvedConversations } = useAnalytics()
  const { showError } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    companyName: user?.companyName || "",
    avatar: user?.avatar || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate real stats
  const totalMembers = members.length;

  // Real stats
  const stats = [
    { 
      icon: MessageSquare, 
      label: "Conversations", 
      value: totalConversations.toString() || "0" 
    },
    { 
      icon: Users, 
      label: "Team Members", 
      value: totalMembers.toString() || "0" 
    },
    { 
      icon: Star, 
      label: "Rating", 
      value: "4.8" 
    },
    { 
      icon: TrendingUp, 
      label: "Resolution Rate", 
      value: `${resolutionRate}%` || "0%" 
    },
  ];

  const membershipSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : "N/A";

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !avatarPreview) return;

    setIsUploading(true);
    try {
      await updateProfile({ avatar: avatarPreview });
      setAvatarFile(null);

      await refreshUser?.();
    } catch (error) {
      showError('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: { name: string; companyName: string } = {
        name: formData.name,
        companyName: formData.companyName,
      };

      if (avatarFile) {
        await handleAvatarUpload();
      } else {
        await updateProfile(updateData);
      }

      setIsEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Call your password change API here
      // await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm font-medium"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || isUploading}
                className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save profile changes"
              >
                {isLoading || isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm flex items-center gap-2"
              aria-label="Edit profile"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Row - Now with real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary/20">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                  aria-label="Change profile photo"
                  disabled={isUploading}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload profile photo"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-transparent border-b border-primary/30 focus:border-primary outline-none px-1 w-full sm:w-auto"
                    aria-label="Edit your name"
                    placeholder="Your name"
                  />
                ) : (
                  formData.name
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
              {avatarFile && (
                <p className="text-xs text-green-500 mt-1">
                  New avatar selected: {avatarFile.name}
                  <button
                    onClick={handleAvatarUpload}
                    disabled={isUploading}
                    className="ml-2 text-primary hover:underline disabled:opacity-50"
                    aria-label="Upload new avatar"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="pt-6 space-y-4">
            {/* Company */}
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400" htmlFor="companyName">
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label="Company name"
                  />
                ) : (
                  <p className="mt-1 font-medium">{formData.companyName || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Email - Read only */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400" htmlFor="email">
                  Email Address
                </label>
                <p id="email" className="mt-1 font-medium">{formData.email}</p>
                <p className="text-xs text-green-500 mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Verified
                </p>
              </div>
            </div>

            {/* Membership */}
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Membership
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                    {user?.role || "User"}
                  </span>
                  <span className="text-xs text-gray-400">• Since {membershipSinceYear}</span>
                </div>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Created
                </label>
                <p className="mt-1 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Actions */}
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Security
            </h3>
            
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                aria-label="Open change password form"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                      aria-label="Current password"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                      aria-label="New password"
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                      aria-label="Confirm new password"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Update password"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm font-medium"
                    aria-label="Cancel password change"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <ul className="space-y-2" role="list">
              <li role="listitem">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <Palette className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                  <span className="text-sm">Appearance Settings</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/dashboard/team"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <Users className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                  <span className="text-sm">Manage Team</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/dashboard/widget/customize"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                  <span className="text-sm">Customize Widget</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
            aria-label="Logout from your account"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}