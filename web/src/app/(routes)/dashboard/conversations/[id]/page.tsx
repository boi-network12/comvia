"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Loader2,
  ChevronDown,
  Tag,
  Users,
  Star,
  MessageSquare,
  Mail,
  Phone,
  Copy,
  Trash2,
  Edit2,
  Plus,
  X,
  Paperclip,
  Smile,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { UpdateConversationData } from "@/services/conversations";

const statusColors = {
  open: "text-blue-500 bg-blue-500/10",
  "in-progress": "text-amber-500 bg-amber-500/10",
  resolved: "text-emerald-500 bg-emerald-500/10",
  escalated: "text-red-500 bg-red-500/10",
  closed: "text-gray-500 bg-gray-500/10",
};

export default function ConversationDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const {
    currentConversation,
    messages,
    isLoading,
    loadConversation,
    sendMessage,
    updateConversation,
    addInternalNote,
    assignConversation,
    resolveConversation,
    escalateConversation,
    clearCurrentConversation,
  } = useConversation();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login");
  //     return;
  //   }
  //   if (conversationId) {
  //     loadConversation(conversationId);
  //   }

  //   return () => {
  //     clearCurrentConversation();
  //   };
  // }, [user, router, conversationId, loadConversation, clearCurrentConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await addInternalNote(conversationId, noteContent);
      setNoteContent("");
      setShowNoteInput(false);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleStatusChange = async (status: "open" | "in-progress" | "resolved" | "escalated" | "closed") => {
    await updateConversation(conversationId, { status });
    setShowActions(false);
  };

  if (isLoading || !currentConversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const statusColor =
    statusColors[currentConversation.status as keyof typeof statusColors] ||
    statusColors.open;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-t-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/conversations"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="font-semibold truncate">
              {currentConversation.title || "Conversation"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                {currentConversation.status.charAt(0).toUpperCase() +
                  currentConversation.status.slice(1)}
              </span>
              {currentConversation.metadata?.visitorName && (
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {currentConversation.metadata.visitorName}
                </span>
              )}
              <span className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(currentConversation.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors relative"
            aria-label="show action"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Dropdown */}
      {showActions && (
        <div className="absolute right-4 top-16 z-10 bg-background border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden min-w-[200px]">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleStatusChange("open")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Mark as Open
            </button>
            <button
              onClick={() => handleStatusChange("in-progress")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Mark as In Progress
            </button>
            <button
              onClick={() => resolveConversation(conversationId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Mark as Resolved
            </button>
            <button
              onClick={() => escalateConversation(conversationId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Escalate
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-800" />
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Add Internal Note
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.senderId === user?._id;
            const isSystem = message.senderType === "system";

            return (
              <div
                key={message._id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    isUser
                      ? "bg-primary text-white rounded-2xl rounded-br-none"
                      : isSystem
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl text-sm"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none"
                  } p-3`}
                >
                  {!isUser && !isSystem && (
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">
                        {message.senderType === "agent" ? "Agent" : "Visitor"}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Internal Note Input */}
      {showNoteInput && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800/50">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add internal note..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
            <button
              onClick={handleAddNote}
              disabled={!noteContent.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Add Note
            </button>
            <button
              onClick={() => setShowNoteInput(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="show input"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex gap-2 p-3 bg-background border border-gray-200/50 dark:border-gray-800/50 rounded-b-2xl"
      >
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-gray-400"
          aria-label="sending message"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={isSending}
        />
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-gray-400"
          aria-label="btn"
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="p-2 px-4 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}