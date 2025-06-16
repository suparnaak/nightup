export type ChatRole = "user" | "host";

export interface Message {
  id?: string;
  senderId: string;
  receiverId?: string;
  eventId?: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  lastMessageSenderId?: string;
  eventId: string;
  otherId: string;
  otherName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}