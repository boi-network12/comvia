// app/(auth)/setup/integrations/page.tsx (Step 5: Integrations)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Check,
  Zap,
  Mail as MailIcon,
} from "lucide-react";
import { FaGithub, FaSlack } from "react-icons/fa6";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { FiZoomIn } from "react-icons/fi";
import { useAuth } from "@/contexts";


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

// Type for integration entries
type IntegrationEntry = {
  enabled: boolean;
  [key: string]: unknown;
};

export default function SetupIntegrationsPage() {
  const router = useRouter();
  const { user, setupIntegrations, isLoading: authLoading } = useAuth();
  const defaultSelected = ["slack", "email"];
   const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(defaultSelected);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing integrations from user data
   useEffect(() => {
    if (user?.integrations) {
      // Type-safe way to get enabled integrations
      const enabledIntegrations = Object.entries(user.integrations)
        .filter(([, value]) => {
          // Type guard to check if value has an 'enabled' property
          const integration = value as IntegrationEntry | undefined;
          return integration?.enabled === true;
        })
        .map(([key]) => key);
      
      if (enabledIntegrations.length > 0) {
        // eslint-disable-next-line
        setSelectedIntegrations(enabledIntegrations);
      }
    }
  }, [user]);

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };
  

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Use AuthContext's setupIntegrations method
      await setupIntegrations(selectedIntegrations);
      router.push("/setup/complete");
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
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
            Complete Setup
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}