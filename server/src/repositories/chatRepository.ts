
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { Types } from 'mongoose';
import ChatMessage, { IChatMessage } from "../models/chatMessage";
import { IConversationResult } from '../services/interfaces/IChatService';
import { IUserRepository } from './interfaces/IUserRepository';
import { IHostRepository } from './interfaces/IHostRepository';
import { IChatRepository } from './interfaces/IChatRepository';

@injectable()
export class ChatRepository implements IChatRepository {
 constructor(
  @inject(TYPES.UserRepository)
  private userRepository: IUserRepository,
  @inject(TYPES.HostRepository)
  private hostRepository: IHostRepository
 ){}
  
  async fetchMessages(
      eventId: string,
      p1Id: string,
      p2Id: string
    ): Promise<IChatMessage[]> {
   
    const messages = await ChatMessage.find({
      eventId: new Types.ObjectId(eventId),
      $or: [
        { senderId: new Types.ObjectId(p1Id), receiverId: new Types.ObjectId(p2Id) },
        { senderId: new Types.ObjectId(p2Id), receiverId: new Types.ObjectId(p1Id) }
      ]
    }).sort({ timestamp: 1 }).lean();
    
    await ChatMessage.updateMany(
      { 
        eventId: new Types.ObjectId(eventId),
        senderId: new Types.ObjectId(p2Id),
        receiverId: new Types.ObjectId(p1Id),
        isRead: false 
      },
      { $set: { isRead: true } }
    );
    
    return messages;
  }

  async saveMessage(
    eventId: string,
    senderId: string,
    senderType: string,
    receiverId: string,
    receiverType: string,
    content: string
  ): Promise<IChatMessage> {
    const message = new ChatMessage({
      eventId: new Types.ObjectId(eventId),
      senderId: new Types.ObjectId(senderId),
      senderType,
      receiverId: new Types.ObjectId(receiverId),
      receiverType,
      content,
      isRead: false 
    });
    return message.save();
  }

  async markMessagesAsRead(eventId: string, userId: string, otherId: string): Promise<void> {
    await ChatMessage.updateMany(
      { 
        eventId: new Types.ObjectId(eventId),
        senderId: new Types.ObjectId(otherId),
        receiverId: new Types.ObjectId(userId),
        isRead: false 
      },
      { $set: { isRead: true } }
    );
  }
 
  async listConversations(participantId: string): Promise<IConversationResult[]> {
    const pid = new Types.ObjectId(participantId);
    
    const conversations = await ChatMessage.aggregate([
      
      {
        $match: {
          $or: [
            { senderId: pid },
            { receiverId: pid }
          ]
        }
      },
      
      {
        $group: {
          _id: {
            eventId: '$eventId',
            otherId: {
              $cond: [
                { $eq: ['$senderId', pid] },
                '$receiverId',
                '$senderId'
              ]
            },
            otherType: {
              $cond: [
                { $eq: ['$senderId', pid] },
                '$receiverType',
                '$senderType'
              ]
            }
          },
          lastMessage: { $last: '$content' },
          updatedAt: { $last: '$timestamp' },
          unreadCount: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ['$receiverId', pid] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ] 
            }
          }
        }
      },
      
      {
        $project: {
          _id: 0,
          eventId: '$_id.eventId',
          otherId: '$_id.otherId',
          otherType: '$_id.otherType',
          lastMessage: 1,
          updatedAt: 1,
          unreadCount: 1
        }
      },
      
      { $sort: { updatedAt: -1 } }
    ]);

    
    const result: IConversationResult[] = [];

    for (const convo of conversations) {
      let otherName = '';
      
     
      if (convo.otherType === 'user') {
        const user = await this.userRepository.findById(convo.otherId.toString());
        otherName = user ? user.name : 'Unknown User';
      } else if (convo.otherType === 'host') {
        const host = await this.hostRepository.getHostProfile(convo.otherId.toString());
        otherName = host && host.name ? host.name : 'Unknown Host';
      }
      
      result.push({
        eventId: convo.eventId,
        otherId: convo.otherId,
        otherName: otherName,
        lastMessage: convo.lastMessage,
        updatedAt: convo.updatedAt,
        unreadCount: convo.unreadCount
      });
    }
    
    return result;
  }
}

