// src/components/Widget/WidgetInput.tsx

import React, { useState, useRef } from 'react';
import type { KeyboardEvent } from "react";
import { Send, Paperclip } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget';
import { cn } from '../../utils/helpers';

interface WidgetInputProps {
  onSend: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export const WidgetInput: React.FC<WidgetInputProps> = ({ 
  onSend, 
  onTyping, 
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useWidget();
  const color = settings?.color || '#F97316';

  // &&isConnected
  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleFocus = () => {
  setIsFocused(true);
    // Prevent the page from scrolling when input is focused on mobile
    if (window.innerWidth <= 768) {
      // Scroll the input into view smoothly
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  };

  return (
    <div
      className={cn(
        'p-3 border-t border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900 '
      )}
    >
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          disabled
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          placeholder={"Type a message..." }
          className={cn(
            'flex-1 px-3 py-2 rounded-lg',
            'bg-gray-100 dark:bg-gray-800',
            'text-sm focus:outline-none',
            'transition-all duration-200',
            isFocused && 'ring-1'
          )}
          style={isFocused ? { '--tw-ring-color': color } as React.CSSProperties : undefined}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={cn(
            'p-2 rounded-lg text-white transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:shadow-lg hover:scale-105'
          )}
          style={{ backgroundColor: color }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};