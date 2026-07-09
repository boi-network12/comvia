
// widget/src/components/widget/Widget.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetButton } from './WidgetButton';
import { WidgetHeader } from './WidgetHeader';
import { WidgetBody } from './WidgetBody';
import { WidgetInput } from './WidgetInput';
import { WidgetFooter } from './WidgetFooter';
import { WidgetQuickReplies } from './WidgetQuickReplies';
import { cn } from '../../utils/helpers';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useWidget } from '../../hooks/useWidget';

export const Widget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    messages,
    isTyping,
    settings,
    isLoading,
    closeWidget,
    toggleWidget,
    sendMessage,
    sendTyping,
    connectSocket,
    companyId, 
    isConnected,
  } = useWidget();
  
  const [unreadCount] = useState(0);
  const isMobile = useIsMobile();
  const widgetRef = useRef<HTMLDivElement>(null);
  const connectionAttempted = useRef(false);

  // ✅ Only connect ONCE when component mounts AND settings are loaded AND we have a companyId
  useEffect(() => {
    // Skip if already attempted, still loading, or no companyId
    if (connectionAttempted.current || isLoading || !companyId) {
      return;
    }
    
    // Skip if already connected
    if (isConnected) {
      return;
    }
    
    connectionAttempted.current = true;
    // console.log('🔌 Widget mounting, initiating connection...');
    connectSocket();
  }, [isLoading, companyId, isConnected, connectSocket]);

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
      // console.log(`🏢 Widget initialized for company: ${companyId}`);
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
            className={cn(
              isMobile && 'fixed inset-x-0 top-0 w-full',
              isMobile && 'h-[100dvh] min-h-[100dvh]',
              !isMobile && 'rounded-2xl mb-4 w-[380px] max-w-[calc(100vw-32px)]',
              !isMobile && 'h-[600px] max-h-[85vh]',
              'flex flex-col',
              'bg-white dark:bg-gray-900',
              'shadow-2xl border border-gray-200/50 dark:border-gray-800/50',
              'overflow-hidden',
              isMinimized ? '' : 'h-[600px] max-h-[85vh]'
            )}
            style={{
              fontFamily: settings.font === 'inter' ? 'Inter, system-ui, sans-serif' :
                          settings.font === 'system' ? 'system-ui, sans-serif' :
                          'Inter, system-ui, sans-serif',
              ...(isMobile && {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: '100dvh',
                maxHeight: '100dvh',
                transform: 'none',
              })
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
                />
                <WidgetFooter />
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