// src/components/Widget/WidgetButton.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget';
import { cn } from '../../utils/helpers';

interface WidgetButtonProps {
  onClick: () => void;
  unreadCount: number;
}

export const WidgetButton: React.FC<WidgetButtonProps> = ({ onClick, unreadCount }) => {
  const { isOpen, settings } = useWidget();

  const color = settings?.color || '#F97316';

  return (
    <button
      data-widget-button
      onClick={onClick}
      className={cn(
        'relative w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-300 hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-offset-2'
      )}
      style={{
        backgroundColor: color,
        boxShadow: `0 4px 20px ${color}40`,
        '--tw-ring-color': color,
      } as React.CSSProperties}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <MessageCircle className="w-6 h-6 text-white" />
      )}

      {/* Unread badge */}
      {!isOpen && unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
};