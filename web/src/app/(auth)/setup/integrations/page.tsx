// app/(auth)/setup/integrations/page.tsx (Step 5: Integrations)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Check,
  Zap,
  Mail as MailIcon,
  MessageCircle,
} from "lucide-react";
import { FaGithub, FaSlack } from "react-icons/fa6";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { FiZoomIn } from "react-icons/fi";

const integrations = [
  { id: "slack", icon: FaSlack, name: "Slack", description: "Get notifications in Slack" },
  { id: "email", icon: MailIcon, name: "Email", description: "Receive email notifications" },
  { id: "facebook", icon: FaFacebook, name: "Facebook", description: "Connect Facebook Messenger" },
  { id: "instagram", icon: FaInstagram, name: "Instagram", description: "Connect Instagram DMs" },
  { id: "twitter", icon: FaTwitter, name: "Twitter", description: "Connect Twitter DMs" },
  { id: "github", icon: FaGithub, name: "GitHub", description: "Sync issues with GitHub" },
  { id: "zoom", icon: FiZoomIn, name: "Zoom", description: "Schedule support calls" },
  { id: "zapier", icon: Zap, name: "Zapier", description: "Connect 1000+ apps" },
];

export default function SetupIntegrationsPage() {
  const router = useRouter();
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(["slack", "email"]);

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    router.push("/setup/complete");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3" />
          Step 5 of 6
        </div>
        <h1 className="text-2xl font-bold">Connect integrations</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Connect your favorite tools to streamline your workflow
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isSelected = selectedIntegrations.includes(integration.id);
          
          return (
            <button
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              className={`group p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{integration.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {integration.description}
                </p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2"
      >
        Complete Setup
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}