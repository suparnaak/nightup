import { io } from '../config/SocketServer';
import { IChatMessage } from '../models/chatMessage';
import ChatRepository from '../repositories/chatRepository';
import { IChatService, IConversationResult } from './interfaces/IChatService';

class ChatService implements IChatService {
 
  async fetchMessages(
      eventId: string,
      userId: string,
      userType: string,
      otherId: string,
      otherType: string
    ): Promise<IChatMessage[]> {
    
    return ChatRepository.fetchMessages(eventId, userId, otherId);
  }

  async sendMessage(
    eventId: string,
    senderId: string,
    senderType: string,
    receiverId: string,
    receiverType: string,
    content: string
  ): Promise<IChatMessage> {
    const msg = await ChatRepository.saveMessage(
      eventId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      content
    );

   
    const receiverRoom = `user-${receiverId}`;
    io.to(receiverRoom).emit('receiveMessage', msg);

    return msg;
  }

  async listConversations(participantId: string): Promise<IConversationResult[]> {
    return ChatRepository.listConversations(participantId);
  }

}

export default new ChatService();