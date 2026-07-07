// widget/src/components/widget/Widget.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetContext } from '../../context/WidgetContext';
import { WidgetButton } from './WidgetButton';
import { WidgetHeader } from './WidgetHeader';
import { WidgetBody } from './WidgetBody';
import { WidgetInput } from './WidgetInput';
import { WidgetFooter } from './WidgetFooter';
import { WidgetQuickReplies } from './WidgetQuickReplies';
import { cn } from '../../utils/helpers';
import { useIsMobile } from '../../hooks/useIsMobile';

export const Widget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    messages,
    isTyping,
    settings,
    isConnected,
    isLoading,
    error,
    closeWidget,
    toggleWidget,
    sendMessage,
    sendTyping,
    connectSocket,
    companyId, 
  } = useWidgetContext();
  const [unreadCount] = useState(0);
  const isMobile = useIsMobile();
  const widgetRef = useRef<HTMLDivElement>(null);
  const connectionAttempted = useRef(false);

  // Only connect once when component mounts
  useEffect(() => {
    // ✅ Prevent multiple connection attempts
    if (!connectionAttempted.current && !isConnected && !isLoading) {
      connectionAttempted.current = true;
      console.log('🔌 Widget mounting, initiating connection...');
      connectSocket();
    }
  }, []); // Empty dependency array

  // Close widget on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWidget();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeWidget]);

  // Log company ID for debugging
  useEffect(() => {
    if (companyId) {
      console.log(`🏢 Widget initialized for company: ${companyId}`);
    }
  }, [companyId]);

  if (!settings) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const widgetPosition = settings.position || 'bottom-right';

  return (
    <div
      ref={widgetRef}
      className={cn(
        'fixed z-[9999]',
        positionClasses[widgetPosition],
        'flex flex-col items-end'
      )}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              isMobile && 'min-w-screen min-h-screen',
              isMobile && 'fixed right-0 top-0 left-0 bottom-0',
              !isMobile && 'rounded-2xl',
              !isMobile && 'mb-4 w-[380px] max-w-[calc(100vw-32px)]',
              'flex flex-col',
              'bg-white dark:bg-gray-900',
              'shadow-2xl',
              'border border-gray-200/50 dark:border-gray-800/50',
              'overflow-hidden',
              isMinimized ? 'h-16' : 'h-[600px] max-h-[85vh]'
            )}
            style={{
              fontFamily: settings.font === 'inter' ? 'Inter, system-ui, sans-serif' :
                          settings.font === 'system' ? 'system-ui, sans-serif' :
                          'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <WidgetHeader onToggleMinimize={() => {}} onClose={closeWidget} />

            {/* Body */}
            {!isMinimized && (
              <>
                <WidgetBody messages={messages} isTyping={isTyping} />
                <WidgetQuickReplies
                  replies={settings.quickReplies}
                  onSelect={(reply) => {
                    sendMessage(reply, 'user');
                  }}
                />
                <WidgetInput
                  onSend={(message) => {
                    sendMessage(message, 'user');
                  }}
                  onTyping={(typing) => {
                    sendTyping(typing);
                  }}
                  isConnected={isConnected}
                />
                <WidgetFooter />
                {/* Connection Status */}
                {!isConnected && !isLoading && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 text-center">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      ⚠️ {error || 'Connecting to chat server...'}
                      <button 
                        onClick={() => {
                          connectionAttempted.current = false;
                          connectSocket();
                        }}
                        className="ml-2 underline font-medium"
                      >
                        Retry
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!(isMobile && isOpen) && (
        <WidgetButton
          onClick={toggleWidget}
          unreadCount={unreadCount}
        />
      )}
    </div>
  );
};