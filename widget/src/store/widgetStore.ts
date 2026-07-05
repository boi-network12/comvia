// src/store/widgetStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  WidgetState,
  Message,
  WidgetSettings,
  User,
} from '../types';

interface WidgetStore extends WidgetState {
  // Actions
  toggleWidget: () => void;
  openWidget: () => void;
  closeWidget: () => void;
  minimizeWidget: () => void;
  maximizeWidget: () => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setMessages: (messages: Message[]) => void;
  setTyping: (isTyping: boolean) => void;
  setSettings: (settings: WidgetSettings) => void;
  setUser: (user: User | null) => void;
  setConnected: (isConnected: boolean) => void;
  clearUnread: () => void;
  incrementUnread: () => void;
  reset: () => void;
}

const defaultMessages: Message[] = [
  {
    id: '1',
    content: 'Hi there! 👋 How can I help you today?',
    sender: 'bot',
    timestamp: new Date(),
    status: 'read',
  },
];

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      isMinimized: false,
      messages: defaultMessages,
      isTyping: false,
      unreadCount: 0,
      settings: null,
      user: null,
      isConnected: false,

      // Actions
      toggleWidget: () => {
        const { isOpen, clearUnread } = get();
        if (!isOpen) {
          clearUnread();
        }
        set({ isOpen: !isOpen, isMinimized: false });
      },

      openWidget: () => {
        const { clearUnread } = get();
        clearUnread();
        set({ isOpen: true, isMinimized: false });
      },

      closeWidget: () => {
        set({ isOpen: false, isMinimized: false });
      },

      minimizeWidget: () => {
        set({ isMinimized: true });
      },

      maximizeWidget: () => {
        set({ isMinimized: false });
      },

      addMessage: (message) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          timestamp: new Date(),
          status: 'sent',
          ...message,
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        // If widget is closed, increment unread count
        if (!get().isOpen) {
          set((state) => ({
            unreadCount: state.unreadCount + 1,
          }));
        }

        return newMessage;
      },

      setMessages: (messages) => {
        set({ messages });
      },

      setTyping: (isTyping) => {
        set({ isTyping });
      },

      setSettings: (settings) => {
        set({ settings });
      },

      setUser: (user) => {
        set({ user });
      },

      setConnected: (isConnected) => {
        set({ isConnected });
      },

      clearUnread: () => {
        set({ unreadCount: 0 });
      },

      incrementUnread: () => {
        set((state) => ({
          unreadCount: state.unreadCount + 1,
        }));
      },

      reset: () => {
        set({
          isOpen: false,
          isMinimized: false,
          messages: defaultMessages,
          isTyping: false,
          unreadCount: 0,
          user: null,
          isConnected: false,
        });
      },
    }),
    {
      name: 'comvia-widget-storage',
      partialize: (state) => ({
        settings: state.settings,
        user: state.user,
      }),
    }
  )
);