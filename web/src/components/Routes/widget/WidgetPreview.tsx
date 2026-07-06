// app/components/widget/WidgetPreview.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minimize2,
  Maximize2,
  X,
  Send,
  Paperclip,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { getIconByValue } from "@/constants/widget";

interface WidgetPreviewProps {
  settings: {
    position: string;
    color: string;
    icon: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
  };
  companyName?: string;
  companyLogo?: string;
  className?: string;
  height?: string | number;
}

interface PreviewMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function WidgetPreview({
  settings,
  companyName,
  companyLogo,
  className = "",
  height = "500px",
}: WidgetPreviewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [previewMessages, setPreviewMessages] = useState<PreviewMessage[]>([
    {
      id: "1",
      content: settings.welcomeMessage || "Hi there! 👋 How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef<number>(2);

  // Update welcome message when settings change
  useEffect(() => {
    if (settings.welcomeMessage) {
        // eslint-disable-next-line
      setPreviewMessages((prev) => {
        // Only update if the message is still the welcome message
        const firstMessage = prev[0];
        if (firstMessage && firstMessage.id === "1" && firstMessage.sender === "bot") {
          return [
            {
              ...firstMessage,
              content: settings.welcomeMessage,
            },
            ...prev.slice(1),
          ];
        }
        return prev;
      });
    }
  }, [settings.welcomeMessage]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [previewMessages, isTyping]);

  const SelectedIcon = getIconByValue(settings.icon);
  
  const positionClass = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }[settings.position] || "bottom-6 right-6";

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: PreviewMessage = {
      id: String(messageIdRef.current++),
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setPreviewMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: PreviewMessage = {
        id: String(messageIdRef.current++),
        content: "Thanks for your message! How can I assist you further?",
        sender: "bot",
        timestamp: new Date(),
      };
      setPreviewMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    const userMessage: PreviewMessage = {
      id: String(messageIdRef.current++),
      content: reply,
      sender: "user",
      timestamp: new Date(),
    };
    setPreviewMessages((prev) => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: PreviewMessage = {
        id: String(messageIdRef.current++),
        content: `Great choice! Let me help you with "${reply}".`,
        sender: "bot",
        timestamp: new Date(),
      };
      setPreviewMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div 
      className={`relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    >

      {/* Widget Container */}
      <div className={`absolute ${positionClass}`}>
        <AnimatePresence>
          {isChatOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-4 w-[380px] max-w-[calc(100vw-32px)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
              style={{ 
                fontFamily: settings.font === 'inter' ? 'Inter, system-ui, sans-serif' :
                            settings.font === 'system' ? 'system-ui, sans-serif' :
                            'Inter, system-ui, sans-serif',
                height: isMinimized ? '64px' : '520px',
                maxHeight: '80vh'
              }}
            >
              {/* Widget Header */}
              <div 
                className="p-4 text-white flex-shrink-0" 
                style={{ backgroundColor: settings.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {companyLogo ? (
                      <Image
                        src={companyLogo}
                        alt={companyName || "Company"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                        priority={false}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">
                          {(companyName || "C").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {companyName || "Comvia"}
                      </p>
                      <p className="text-xs opacity-80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                      aria-label={isMinimized ? "Expand chat window" : "Minimize chat window"}
                      title={isMinimized ? "Expand" : "Minimize"}
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                      aria-label="Close chat widget"
                      title="Close chat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Widget Body */}
              {!isMinimized && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/30">
                    {previewMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold"
                            style={{ backgroundColor: settings.color }}
                          >
                            {(companyName || "C").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            message.sender === 'user'
                              ? 'rounded-tr-none text-white'
                              : 'rounded-tl-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                          style={message.sender === 'user' ? { backgroundColor: settings.color } : undefined}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <span
                            className={`text-[10px] mt-1 block ${
                              message.sender === 'user' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex items-start gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold"
                          style={{ backgroundColor: settings.color }}
                        >
                          {(companyName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                                animate={{ y: [0, -6, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  {settings.quickReplies && settings.quickReplies.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                      <div className="flex flex-wrap gap-2">
                        {settings.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                            style={{
                              borderColor: settings.color,
                              color: settings.color,
                              backgroundColor: `${settings.color}10`,
                            }}
                            aria-label={`Quick reply: ${reply}`}
                            title={`Click to reply: ${reply}`}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Widget Input */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Attach file"
                        title="Attach file"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': settings.color } as React.CSSProperties}
                        aria-label="Type a message"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="p-2 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
                        style={{ backgroundColor: settings.color }}
                        aria-label="Send message"
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Widget Footer */}
                  <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center justify-center gap-1.5">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400">
                        Powered by <span className="font-medium text-gray-500 dark:text-gray-300">Comvia</span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            /* Widget Button */
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsChatOpen(true)}
              className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: settings.color,
                boxShadow: `0 4px 20px ${settings.color}40`,
                '--tw-ring-color': settings.color,
              } as React.CSSProperties}
              aria-label="Open chat widget"
              title="Open chat"
            >
              <div className="w-6 h-6 text-white">
                {SelectedIcon}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}