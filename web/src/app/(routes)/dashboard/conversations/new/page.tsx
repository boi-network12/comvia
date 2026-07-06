// app/(routes)/dashboard/conversations/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Users,
  Mail,
  MessageSquare,
  Loader2,
  X,
  Plus,
  ChevronDown,
  Check,
  Sparkles,
  Globe,
  AtSign,
  UserPlus,
  Tag,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Channel = "widget" | "email" | "facebook" | "instagram" | "twitter" | "api";
type Priority = "low" | "medium" | "high" | "urgent";

interface FormData {
  title: string;
  channel: Channel;
  priority: Priority;
  assignedTo: string;
  tags: string[];
  metadata: {
    visitorName: string;
    visitorEmail: string;
    page: string;
    browser: string;
    location: string;
  };
}

const channels: { value: Channel; label: string; icon: React.ReactNode }[] = [
  { value: "widget", label: "Widget", icon: <Globe className="w-4 h-4" /> },
  { value: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { value: "facebook", label: "Facebook", icon: <MessageSquare className="w-4 h-4" /> },
  { value: "instagram", label: "Instagram", icon: <MessageSquare className="w-4 h-4" /> },
  { value: "twitter", label: "Twitter", icon: <MessageSquare className="w-4 h-4" /> },
  { value: "api", label: "API", icon: <MessageSquare className="w-4 h-4" /> },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-gray-500 bg-gray-500/10" },
  { value: "medium", label: "Medium", color: "text-blue-500 bg-blue-500/10" },
  { value: "high", label: "High", color: "text-orange-500 bg-orange-500/10" },
  { value: "urgent", label: "Urgent", color: "text-red-500 bg-red-500/10" },
];

export default function NewConversationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { createConversation, isLoading: convLoading } = useConversation();
  const { members, loadMembers, isLoading: teamLoading } = useTeam();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    channel: "widget",
    priority: "medium",
    assignedTo: "",
    tags: [],
    metadata: {
      visitorName: "",
      visitorEmail: "",
      page: "",
      browser: "",
      location: "",
    },
  });

  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load team members
//   useEffect(() => {
//     if (user) {
//       loadMembers();
//     }
//   }, [user, loadMembers]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".") as ["metadata", keyof FormData["metadata"]];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (formData.tags.length < 5) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.metadata.visitorName.trim()) {
      newErrors["metadata.visitorName"] = "Visitor name is required";
    }
    if (formData.metadata.visitorEmail && !isValidEmail(formData.metadata.visitorEmail)) {
      newErrors["metadata.visitorEmail"] = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const conversationData = {
        title: formData.title.trim(),
        channel: formData.channel,
        metadata: {
          visitorName: formData.metadata.visitorName.trim(),
          visitorEmail: formData.metadata.visitorEmail.trim() || undefined,
          page: formData.metadata.page.trim() || undefined,
          browser: formData.metadata.browser.trim() || undefined,
          location: formData.metadata.location.trim() || undefined,
        },
        assignedTo: formData.assignedTo || undefined,
        priority: formData.priority,
        tags: formData.tags,
      };

      const conversation = await createConversation(conversationData);
      
      // Redirect to the new conversation
      router.push(`/dashboard/conversations/${conversation._id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setErrors({ submit: "Failed to create conversation. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/conversations"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Conversations
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Conversation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start a new conversation with a visitor or customer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/conversations")}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || convLoading}
            className="px-4 py-2 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || convLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Conversation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Conversation Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Support request about pricing"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Visitor Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Visitor Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="metadata.visitorName"
                    value={formData.metadata.visitorName}
                    onChange={handleChange}
                    placeholder="Enter visitor name"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      errors["metadata.visitorName"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  />
                </div>
                {errors["metadata.visitorName"] && (
                  <p className="text-xs text-red-500 mt-1">{errors["metadata.visitorName"]}</p>
                )}
              </div>

              {/* Visitor Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Visitor Email
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="metadata.visitorEmail"
                    value={formData.metadata.visitorEmail}
                    onChange={handleChange}
                    placeholder="visitor@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      errors["metadata.visitorEmail"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  />
                </div>
                {errors["metadata.visitorEmail"] && (
                  <p className="text-xs text-red-500 mt-1">{errors["metadata.visitorEmail"]}</p>
                )}
              </div>

              {/* Page (optional) */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Page URL
                </label>
                <input
                  type="text"
                  name="metadata.page"
                  value={formData.metadata.page}
                  onChange={handleChange}
                  placeholder="https://example.com/pricing"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tags (max 5)
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-background min-h-[48px]">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors"
                        aria-label="tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.tags.length < 5 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag (press Enter)"
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to add a tag
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Channel */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Channel
                </label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="channel"
                >
                  {channels.map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="priority"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Assign To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={teamLoading}
                  aria-label="assign to"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.name || member.email}
                      {member.role === "admin" && " (Admin)"}
                    </option>
                  ))}
                </select>
                {teamLoading && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading team members...
                  </p>
                )}
              </div>

              {/* Browser & Location (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Browser
                  </label>
                  <input
                    type="text"
                    name="metadata.browser"
                    value={formData.metadata.browser}
                    onChange={handleChange}
                    placeholder="Chrome, Firefox..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    name="metadata.location"
                    value={formData.metadata.location}
                    onChange={handleChange}
                    placeholder="New York, USA"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Quick actions preview */}
              <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Quick Summary
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Title:</span>
                    <span className="font-medium">
                      {formData.title || "Untitled"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Visitor:</span>
                    <span className="font-medium">
                      {formData.metadata.visitorName || "Unknown"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Channel:</span>
                    <span className="font-medium capitalize">
                      {formData.channel}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      priorities.find(p => p.value === formData.priority)?.color
                    }`}>
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </span>
                  </p>
                  {formData.tags.length > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Tags:</span>
                      <span className="flex flex-wrap gap-1">
                        {formData.tags.map(tag => (
                          <span key={tag} className="text-xs text-primary">#{tag}</span>
                        ))}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}