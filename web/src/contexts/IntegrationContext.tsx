// web/contexts/IntegrationContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '@/services/auth';
import { integrationAPI } from '@/services/integrations';
import { useAuth } from './AuthContext';

interface IntegrationStatus {
  slack: {
    enabled: boolean;
    channel?: string;
  };
  facebook: {
    enabled: boolean;
    pageId?: string;
    pageName?: string;
  };
  github: {
    enabled: boolean;
    repo?: string;
    owner?: string;
  };
  email: {
    enabled: boolean;
    notifications: {
      newMessage: boolean;
      newTicket: boolean;
      teamInvite: boolean;
    };
  };
  zapier: {
    enabled: boolean;
    triggers?: string[];
  };
}

interface IntegrationContextType {
  integrations: IntegrationStatus;
  isLoading: boolean;
  connectSlack: (webhookUrl: string, channel: string) => Promise<void>;
  disconnectSlack: () => Promise<void>;
  connectFacebook: (pageId: string, accessToken: string, pageName?: string) => Promise<void>;
  disconnectFacebook: () => Promise<void>;
  connectGitHub: (accessToken: string, repo: string, owner?: string) => Promise<void>;
  disconnectGitHub: () => Promise<void>;
  updateEmailSettings: (enabled: boolean, notifications: {
    newMessage: boolean;
    newTicket: boolean;
    teamInvite: boolean;
  }) => Promise<void>;
  connectZapier: (webhookUrl: string, triggers?: string[]) => Promise<void>;
  disconnectZapier: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    slack: { enabled: false },
    facebook: { enabled: false },
    github: { enabled: false },
    email: {
      enabled: true,
      notifications: {
        newMessage: true,
        newTicket: true,
        teamInvite: true,
      },
    },
    zapier: { enabled: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refreshStatus = async () => {
     // Only fetch if user is authenticated
    if (!user) return;

    setIsLoading(true);
    try {
      // Use the bulk API to get all statuses at once
      const status = await integrationAPI.getAllIntegrationStatus();

      // Fetch all integration statuses in parallel
      // const [slack, facebook, github, email, zapier] = await Promise.all([
      //   integrationAPI.getSlackStatus(),
      //   integrationAPI.getFacebookStatus(),
      //   integrationAPI.getGitHubStatus(),
      //   integrationAPI.getEmailSettings(),
      //   integrationAPI.getZapierStatus(),
      // ]);

      setIntegrations({
        slack: status.slack || { enabled: false },
        facebook: status.facebook || { enabled: false },
        github: status.github || { enabled: false },
        email: status.email || {
          enabled: true,
          notifications: {
            newMessage: true,
            newTicket: true,
            teamInvite: true,
          },
        },
        zapier: status.zapier || { enabled: false },
      });
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load integration status when user changes (login/refresh)
  useEffect(() => {
    if (user && !hasLoaded) {
      // eslint-disable-next-line
      refreshStatus();
      setHasLoaded(true);
    }
  }, [user, hasLoaded]);

  // ✅ Re-fetch when user changes (e.g., after token refresh)
  // useEffect(() => {
  //   if (user) {
  //     // eslint-disable-next-line
  //     refreshStatus();
  //   }
  // }, [user?._id]); // Re-fetch when user ID changes

  const connectSlack = async (webhookUrl: string, channel: string) => {
    setIsLoading(true);
    try {
      await integrationAPI.connectSlack(webhookUrl, channel);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSlack = async () => {
    setIsLoading(true);
    try {
      await integrationAPI.disconnectSlack();
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const connectFacebook = async (pageId: string, accessToken: string, pageName?: string) => {
    setIsLoading(true);
    try {
      await integrationAPI.connectFacebook(pageId, accessToken, pageName);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFacebook = async () => {
    setIsLoading(true);
    try {
      await integrationAPI.disconnectFacebook();
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const connectGitHub = async (accessToken: string, repo: string, owner?: string) => {
    setIsLoading(true);
    try {
      await integrationAPI.connectGitHub(accessToken, repo, owner);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGitHub = async () => {
    setIsLoading(true);
    try {
      await integrationAPI.disconnectGitHub();
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailSettings = async (enabled: boolean, notifications: {
    newMessage: boolean;
    newTicket: boolean;
    teamInvite: boolean;
  }) => {
    setIsLoading(true);
    try {
      await integrationAPI.updateEmailSettings(enabled, notifications);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const connectZapier = async (webhookUrl: string, triggers?: string[]) => {
    setIsLoading(true);
    try {
      await integrationAPI.connectZapier(webhookUrl, triggers);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectZapier = async () => {
    setIsLoading(true);
    try {
      await integrationAPI.disconnectZapier();
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IntegrationContext.Provider
      value={{
        integrations,
        isLoading,
        connectSlack,
        disconnectSlack,
        connectFacebook,
        disconnectFacebook,
        connectGitHub,
        disconnectGitHub,
        updateEmailSettings,
        connectZapier,
        disconnectZapier,
        refreshStatus,
      }}
    >
      {children}
    </IntegrationContext.Provider>
    );
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
}