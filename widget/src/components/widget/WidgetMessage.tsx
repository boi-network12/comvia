// src/components/Widget/WidgetMessage.tsx

import React from 'react';
import type { Message } from '../../types';
import { cn } from '../../utils/helpers';
import { useWidget } from '../../hooks/useWidget';

interface WidgetMessageProps {
  message: Message;
}

export const WidgetMessage: React.FC<WidgetMessageProps> = ({ message }) => {
  const { settings } = useWidget();
  const isUser = message.sender === 'user';
  const color = settings?.color || '#F97316';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 scroll',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold"
          style={{ backgroundColor: color }}
        >
          {settings?.companyName?.charAt(0).toUpperCase() || 'C'}
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
          isUser
            ? 'rounded-tr-none text-white'
            : 'rounded-tl-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        )}
        style={isUser ? { backgroundColor: color } : undefined}
      >
        <p className="text-sm break-words">{message.content}</p>
        <span
          className={cn(
            'text-[10px] mt-1 block',
            isUser ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};