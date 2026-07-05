// src/components/Widget/WidgetQuickReplies.tsx

import React from 'react';
import { useWidget } from '../../hooks/useWidget';

interface WidgetQuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export const WidgetQuickReplies: React.FC<WidgetQuickRepliesProps> = ({
  replies,
  onSelect,
}) => {
  const { settings } = useWidget();
  const color = settings?.color || '#F97316';

  if (!replies || replies.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap gap-2">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSelect(reply)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
            style={{
              borderColor: color,
              color: color,
              backgroundColor: `${color}10`,
            }}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};