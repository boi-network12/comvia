import { RefreshCw } from 'lucide-react';
import React from 'react'

interface AgentStatusBadgeProps {
    onlineAgents: {
        online: boolean;
        active: boolean;
        count: number;
        agents: Array<{ id: string; name: string; lastActivity: string }>;
    } | null;
    refreshOnlineAgents: () => void;
}

const AgentStatusBadge = ({ onlineAgents, refreshOnlineAgents }: AgentStatusBadgeProps) => {
    if (!onlineAgents) return null;
    
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            onlineAgents.active ? 'bg-emerald-500 animate-pulse' : 
            onlineAgents.online ? 'bg-amber-500' : 'bg-gray-400'
          }`} />
          <span className="text-sm font-medium">
            {onlineAgents.active ? 'Agents Online' :
             onlineAgents.online ? 'Agents Inactive' : 'No Agents Online'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {onlineAgents.count} agent{onlineAgents.count !== 1 ? 's' : ''}
        </span>
        <button
          onClick={refreshOnlineAgents}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  };

export default AgentStatusBadge