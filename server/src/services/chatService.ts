import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { io } from '../config/SocketServer';
import { IChatMessage } from '../models/chatMessage';
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IChatService, IConversationResult } from './interfaces/IChatService';

@injectable()
export class ChatService implements IChatService {
 
  constructor(
    @inject(TYPES.ChatRepository)
    private chatRepository:IChatRepository,

  ){}
  async fetchMessages(
      eventId: string,
      userId: string,
      userType: string,
      otherId: string,
      otherType: string
    ): Promise<IChatMessage[]> {
    
    return this.chatRepository.fetchMessages(eventId, userId, otherId);
  }

  async sendMessage(
    eventId: string,
    senderId: string,
    senderType: string,
    receiverId: string,
    receiverType: string,
    content: string
  ): Promise<IChatMessage> {
    const msg = await this.chatRepository.saveMessage(
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
    return this.chatRepository.listConversations(participantId);
  }

}

//export default new ChatService();