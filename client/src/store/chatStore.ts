import { create } from "zustand";
import { chatRepository } from "../repositories/chatRepository";
import { useAuthStore } from "./authStore";

type ChatRole = "user" | "host";

export interface Message {
  id?: string;
  senderId: string;
  receiverId?: string;
  eventId?: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  eventId: string;
  otherId: string;
  otherName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversations: Conversation[];
  isListLoading: boolean;
  listError: string | null;

  fetchMessages: (receiverId: string, eventId: string) => Promise<void>;
  sendMessage: (hostId: string, eventId: string, content: string) => Promise<void>;
  listConversations: () => Promise<void>;
  setMessages: (newMessages: Message[] | ((prevMessages: Message[]) => Message[])) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  conversations: [],
  isLoading: false,
  error: null,
  isListLoading: false,
  listError: null,

  setMessages: (newMessages) => {
    if (typeof newMessages === 'function') {
      set((state) => ({ messages: newMessages(state.messages) }));
    } else {
      set({ messages: newMessages });
    }
  },

  fetchMessages: async (receiverId, eventId) => {
    const { user } = useAuthStore.getState();
    const roleRaw = user?.role;
    // Map admin to host context for chat
    console.log(receiverId);
    const chatRole: ChatRole = roleRaw === "host" || roleRaw === "admin" ? "host" : "user";
    set({ isLoading: true, error: null });
    try {
      const messages = await chatRepository.fetchMessages(receiverId, eventId, chatRole);
      set({ messages, isLoading: false });
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.eventId === eventId && conv.otherId === receiverId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Failed to fetch messages" });
    }
  },

  sendMessage: async (hostId, eventId, content) => {
    const { user } = useAuthStore.getState();
    const roleRaw = user?.role;
    const chatRole: ChatRole = roleRaw === "host" || roleRaw === "admin" ? "host" : "user";
    set({ isLoading: true, error: null });
    try {
      const newMessage = await chatRepository.sendMessage(hostId, eventId, content, chatRole);
      set((state) => ({ messages: [...state.messages, newMessage], isLoading: false }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Failed to send message" });
    }
  },
  
  listConversations: async () => {
    const { user } = useAuthStore.getState();
    const roleRaw = user?.role;
    const chatRole: ChatRole = roleRaw === "host" || roleRaw === "admin" ? "host" : "user";
    set({ isListLoading: true, listError: null });
    try {
      const convos = await chatRepository.listConversations(chatRole);
      set({ conversations: convos, isListLoading: false });
    } catch (err: any) {
      set({ isListLoading: false, listError: err.message || 'Failed to load conversations' });
    }
  },
}));