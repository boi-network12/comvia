// src/components/Widget/WidgetHeader.tsx

import React from 'react';
import { Minimize2, Maximize2, X, Wifi, WifiOff } from 'lucide-react';
import { useWidgetContext } from '../../context';

interface WidgetHeaderProps {
  onToggleMinimize: () => void;
  onClose: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ onClose }) => {
  const { settings, isMinimized, minimizeWidget, maximizeWidget } = useWidgetContext();

  const color = settings?.color || '#F97316';
  const companyName = settings?.companyName || 'Comvia';
  const logo = settings?.companyLogo;

  return (
    <div
      className="p-4 text-white"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          {logo ? (
            <img
              src={logo}
              alt={companyName}
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">
                {companyName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
           <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{companyName}</p>
            <div className="flex items-center gap-1.5">
              {/* Connection Status Indicator */}
              {/* {isConnected ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  <span className="text-xs opacity-80">Online</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block animate-pulse" />
                  <span className="text-xs opacity-80">Connecting...</span>
                </>
              )} */}
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  <span className="text-xs opacity-80">Online</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Connection indicator icon */}
          <div className="hidden sm:block mr-1">
            {/* {isConnected ? (
              <Wifi className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 opacity-70" />
            )} */}
          </div>
          <button
            onClick={isMinimized ? maximizeWidget : minimizeWidget}
            className="hidden md:block p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* {!isConnected && (
        <div className="mt-2 px-2 py-0.5 bg-black/20 rounded text-xs text-center">
          <span className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block animate-pulse" />
            Reconnecting...
          </span>
        </div>
      )} */}
      </div>
    </div>
  );
};