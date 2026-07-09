// app/(routes)/dashboard/integrations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIntegration } from "@/contexts/IntegrationContext";
import { useRouter } from "next/navigation";
import {
  Plug,
  Zap as ZapIcon,
  Mail,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import { FaSlack, FaFacebook, FaGithub } from "react-icons/fa";
import { SiZapier } from "react-icons/si";

interface IntegrationCardProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
  color: string;
}

function IntegrationCard({
  name,
  icon,
  description,
  isConnected,
  onConnect,
  onDisconnect,
  isLoading,
  color,
}: IntegrationCardProps) {
  return (
    <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              Connected
            </span>
          ) : (
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              Disconnected
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={onDisconnect}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="px-4 py-2 text-sm gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
          </button>
        )}
        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="info btn">
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    integrations,
    isLoading,
    connectSlack,
    disconnectSlack,
    connectFacebook,
    disconnectFacebook,
    connectGitHub,
    disconnectGitHub,
    connectZapier,
    disconnectZapier,
    updateEmailSettings,
    refreshStatus,
  } = useIntegration();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});


  const handleConnect = async (type: string, data?: Record<string, unknown>) => {
    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    try {
      switch (type) {
        case "slack":
          // Open modal or redirect to Slack OAuth
          const webhookUrl = prompt("Enter Slack webhook URL:");
          if (webhookUrl) {
            const channel = prompt("Enter Slack channel (e.g., #general):") || "#general";
            await connectSlack(webhookUrl, channel);
          }
          break;
        case "facebook":
          const pageId = prompt("Enter Facebook Page ID:");
          const fbToken = prompt("Enter Facebook Access Token:");
          if (pageId && fbToken) {
            await connectFacebook(pageId, fbToken);
          }
          break;
        case "github":
          const ghToken = prompt("Enter GitHub Personal Access Token:");
          const repo = prompt("Enter repository name (e.g., owner/repo):");
          if (ghToken && repo) {
            await connectGitHub(ghToken, repo);
          }
          break;
        case "zapier":
          const zapierUrl = prompt("Enter Zapier Webhook URL:");
          if (zapierUrl) {
            await connectZapier(zapierUrl);
          }
          break;
        case "email":
          await updateEmailSettings(true, {
            newMessage: true,
            newTicket: true,
            teamInvite: true,
          });
          break;
      }
    } catch (error) {
      console.error(`Failed to connect ${type}:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDisconnect = async (type: string) => {
    if (!confirm(`Are you sure you want to disconnect ${type}?`)) return;
    
    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    try {
      switch (type) {
        case "slack":
          await disconnectSlack();
          break;
        case "facebook":
          await disconnectFacebook();
          break;
        case "github":
          await disconnectGitHub();
          break;
        case "zapier":
          await disconnectZapier();
          break;
        case "email":
          await updateEmailSettings(false, {
            newMessage: false,
            newTicket: false,
            teamInvite: false,
          });
          break;
      }
    } catch (error) {
      console.error(`Failed to disconnect ${type}:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const integrationCards = [
    {
      id: "slack",
      name: "Slack",
      icon: <FaSlack className="w-6 h-6" />,
      description: "Get notifications in Slack",
      isConnected: integrations.slack?.enabled || false,
      color: "bg-[#4A154B]",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FaFacebook className="w-6 h-6" />,
      description: "Connect Facebook Messenger",
      isConnected: integrations.facebook?.enabled || false,
      color: "bg-[#1877F2]",
    },
    {
      id: "github",
      name: "GitHub",
      icon: <FaGithub className="w-6 h-6" />,
      description: "Sync issues with GitHub",
      isConnected: integrations.github?.enabled || false,
      color: "bg-[#181717]",
    },
    {
      id: "zapier",
      name: "Zapier",
      icon: <SiZapier className="w-6 h-6" />,
      description: "Connect 1000+ apps",
      isConnected: integrations.zapier?.enabled || false,
      color: "bg-[#FF4A00]",
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-6 h-6" />,
      description: "Receive email notifications",
      isConnected: integrations.email?.enabled || false,
      color: "bg-primary",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your favorite tools to streamline your workflow
          </p>
        </div>
        <button
          type="button"
          onClick={refreshStatus}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50"
          aria-label="refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold">{integrationCards.length}</p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Connected</p>
          <p className="text-2xl font-bold text-emerald-500">
            {integrationCards.filter((i) => i.isConnected).length}
          </p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Disconnected</p>
          <p className="text-2xl font-bold text-gray-400">
            {integrationCards.filter((i) => !i.isConnected).length}
          </p>
        </div>
        <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <p className="text-2xl font-bold text-primary">
            {integrationCards.filter((i) => i.isConnected).length / integrationCards.length * 100}%
          </p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrationCards.map((card) => (
          <IntegrationCard
            key={card.id}
            name={card.name}
            icon={card.icon}
            description={card.description}
            isConnected={card.isConnected}
            onConnect={() => handleConnect(card.id)}
            onDisconnect={() => handleDisconnect(card.id)}
            isLoading={loadingStates[card.id] || false}
            color={card.color}
          />
        ))}
      </div>

      {/* Coming Soon */}
      <div className="bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          More Integrations Coming Soon
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We&apos;re working on adding more integrations including Instagram, Twitter, Zoom, and more.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Instagram", "Twitter", "Zoom", "WhatsApp", "Telegram"].map((name) => (
            <span
              key={name}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400"
            >
              {name} 🔜
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}