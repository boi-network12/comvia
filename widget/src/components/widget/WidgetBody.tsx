// src/components/Widget/WidgetBody.tsx

import React, { useRef, useEffect } from 'react';
import type { Message } from '../../types';
import { WidgetMessage } from './WidgetMessage';

interface WidgetBodyProps {
  messages: Message[];
}

export const WidgetBody: React.FC<WidgetBodyProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/30"
    >
      {messages.map((message) => (
        <WidgetMessage key={message.id} message={message} />
      ))}
    </div>
  );
};