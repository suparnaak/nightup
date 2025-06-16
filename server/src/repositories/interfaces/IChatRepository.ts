import { IChatMessage } from '../../models/chatMessage';
import { IConversationResult } from '../../services/interfaces/IChatService';

export interface IChatRepository {
  fetchMessages(
    eventId: string,
    p1Id: string,
    p2Id: string
  ): Promise<IChatMessage[]>;

  saveMessage(
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