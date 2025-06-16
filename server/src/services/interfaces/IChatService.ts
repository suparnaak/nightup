import { Document, Types } from 'mongoose';
import { IChatMessage } from '../../models/chatMessage';

export interface IConversationResult {
  eventId: Types.ObjectId;
  otherId: Types.ObjectId;
  otherName: string;
  lastMessage: string;
  updatedAt: Date;
  unreadCount: number;
}

export interface IChatService {
  fetchMessages(
    eventId: string,
    userId: string,
    userType: string,
    otherId: string,
    otherType: string
  ): Promise<IChatMessage[]>;

  sendMessage(
    eventId: string,
    senderId: string,
    senderType: string,
    receiverId: string,
    receiverType: string,
    content: string
  ): Promise<IChatMessage>;

  listConversations(participantId: string): Promise<IConversationResult[]>;
  markMessagesAsRead(eventId: string, userId: string, otherId: string): Promise<void>;
}