export type ChatRole = "user" | "host";

export interface Message {
  _id?: string;
  senderId: string;
  receiverId?: string;
  eventId?: string;
  content: string;
  timestamp: string;
  isTemporary?: boolean;
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