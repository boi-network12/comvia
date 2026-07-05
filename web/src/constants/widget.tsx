// web/constants/widget-icons.ts
import {
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
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const ICON_OPTIONS: IconOption[] = [
  { value: "chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
  { value: "message", label: "Message", icon: <Mail className="w-5 h-5" /> },
  { value: "support", label: "Support", icon: <LifeBuoy className="w-5 h-5" /> },
  { value: "help", label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
  { value: "bot", label: "Bot", icon: <Bot className="w-5 h-5" /> },
  { value: "smile", label: "Smile", icon: <Smile className="w-5 h-5" /> },
  { value: "user", label: "User", icon: <User className="w-5 h-5" /> },
  { value: "shield", label: "Shield", icon: <Shield className="w-5 h-5" /> },
  { value: "zap", label: "Zap", icon: <Zap className="w-5 h-5" /> },
  { value: "star", label: "Star", icon: <Star className="w-5 h-5" /> },
  { value: "heart", label: "Heart", icon: <Heart className="w-5 h-5" /> },
];

// Get icon component by value
export const getIconByValue = (value: string): React.ReactNode => {
  const found = ICON_OPTIONS.find(icon => icon.value === value);
  return found?.icon || <MessageCircle className="w-5 h-5" />;
};

// Get icon label by value
export const getIconLabelByValue = (value: string): string => {
  const found = ICON_OPTIONS.find(icon => icon.value === value);
  return found?.label || "Chat";
};

// Constants for widget settings
export const WIDGET_CONSTANTS = {
  DEFAULT_POSITION: "bottom-right" as const,
  DEFAULT_COLOR: "#F97316",
  DEFAULT_ICON: "chat",
  DEFAULT_FONT: "inter",
  DEFAULT_WELCOME_MESSAGE: "Hi there! 👋 How can I help you today?",
  DEFAULT_QUICK_REPLIES: ["Pricing", "Features", "Support", "Demo"],
};

export const POSITIONS = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "top-right", label: "Top Right" },
  { value: "top-left", label: "Top Left" },
] as const;

export const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "system", label: "System" },
  { value: "sans-serif", label: "Sans Serif" },
] as const;

export const COLORS = [
  "#F97316", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#F59E0B", "#EF4444", "#14B8A6",
  "#6366F1", "#000000",
];