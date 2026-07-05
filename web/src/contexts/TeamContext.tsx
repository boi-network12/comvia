"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { teamAPI, TeamMemberDetail, InviteTeamMemberData, UpdateTeamMemberData } from '@/services/team';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useErrorHandler } from '@/utils/error-handler';

interface TeamContextType {
  members: TeamMemberDetail[];
  onlineMembers: string[];
  isLoading: boolean;
  loadMembers: () => Promise<void>;
  inviteMember: (data: InviteTeamMemberData) => Promise<void>;
  updateMember: (email: string, data: UpdateTeamMemberData) => Promise<void>;
  removeMember: (email: string) => Promise<void>;
  resendInvitation: (email: string) => Promise<void>;
  getOnlineStatus: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler()
  
  const [members, setMembers] = useState<TeamMemberDetail[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Stable callbacks
  const loadMembers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await teamAPI.getTeamMembers();
      setMembers(response.data);
    } catch (error) {
      handleError(error, 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  const inviteMember = useCallback(async (data: InviteTeamMemberData) => {
    setIsLoading(true);
    try {
      const response = await teamAPI.inviteTeamMember(data);
      setMembers(prev => [...prev, { ...response.data, isOnline: false } as TeamMemberDetail]);
      showSuccess(`Invitation sent to ${data.email}!`);
    } catch (error) {
      console.error('Failed to invite member:', error);
      handleError(error, 'Failed to invite team member');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const updateMember = useCallback(async (email: string, data: UpdateTeamMemberData) => {
    setIsLoading(true);
    try {
      const response = await teamAPI.updateTeamMember(email, data);
      setMembers(prev =>
        prev.map(m => m.email === email ? { ...m, ...response.data } : m)
      );
      showSuccess(`Updated ${email}'s role`);
    } catch (error) {
      console.error('Failed to update member:', error);
      handleError(error, 'Failed to update team member');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const removeMember = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await teamAPI.removeTeamMember(email);
      setMembers(prev => prev.filter(m => m.email !== email));
      showSuccess(`Removed ${email} from team`);
    } catch (error) {
      console.error('Failed to remove member:', error);
      handleError(error, 'Failed to remove team member');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const resendInvitation = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await teamAPI.resendInvitation(email);
      showSuccess(`Invitation resent to ${email}`);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      handleError(error, 'Failed to resend invitation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const getOnlineStatus = useCallback(async () => {
    if (!user) return;
    try {
      const response = await teamAPI.getOnlineMembers();
      setOnlineMembers(response.data.online || []);
      
      setMembers(prev =>
        prev.map(m => ({
          ...m,
          isOnline: response.data.online?.includes(m.email) || false,
        }))
      );
    } catch (error) {
      // Silent fail for online status - don't spam errors
      console.debug('Failed to get online status:', error);
    }
  }, [user]);

  // Load members on mount and when user changes
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line
      setHasInitialized(false);
      return;
    }

    // Initial load only once
    if (!hasInitialized) {
      loadMembers();
      getOnlineStatus();
      setHasInitialized(true);
    }

    // Polling only for online status
    const interval = setInterval(getOnlineStatus, 30000);

    return () => clearInterval(interval);
  }, [user, loadMembers, getOnlineStatus, hasInitialized]);

  const contextValue = useMemo(() => ({
    members,
    onlineMembers,
    isLoading,
    loadMembers,
    inviteMember,
    updateMember,
    removeMember,
    resendInvitation,
    getOnlineStatus,
  }), [
    members,
    onlineMembers,
    isLoading,
    loadMembers,
    inviteMember,
    updateMember,
    removeMember,
    resendInvitation,
    getOnlineStatus,
  ]);

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}