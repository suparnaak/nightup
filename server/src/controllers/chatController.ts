import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { Request, Response } from 'express';
import { IChatService } from "../services/interfaces/IChatService";
import { IChatController } from './interfaces/IChatController';
import { MESSAGES, STATUS_CODES } from '../utils/constants';

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class ChatController implements IChatController {
  constructor(@inject(TYPES.ChatService)
  private chatService: IChatService){}
  
  async fetchMessages(req: AuthRequest, res: Response): Promise<void> {
    const participantId = req.user?.userId;
    const participantType = req.user?.type;
    const otherId = req.params.otherId;
    const eventId = req.params.eventId;

    if (!participantId || !participantType) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }

    try {
      const messages = await this.chatService.fetchMessages(
        eventId,
        participantId,
        participantType,
        otherId,
        participantType === 'user' ? 'host' : 'user'
      );
      res.status(STATUS_CODES.SUCCESS).json({ messages });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ message: MESSAGES.COMMON.ERROR.FETCH_MESSAGE_FAILED });
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const senderId = req.user?.userId;
    const senderType = req.user?.type;
    const receiverId = req.params.otherId;
    const eventId = req.params.eventId;
    const { content } = req.body;

    if (!senderId || !senderType) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }
    if (!content || !content.trim()) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MESSAGE_REQUIRED });
      return;
    }

    try {
      const message = await this.chatService.sendMessage(
        eventId,
        senderId,
        senderType,
        receiverId,
        senderType === 'user' ? 'host' : 'user',
        content.trim()
      );
      res.status(STATUS_CODES.CREATED).json({ message });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.COMMON.ERROR.CHAT_FAILED });
    }
  }

  async listConversations(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const userType = req.user?.type;
    
    if (!userId || !userType) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }
    
    try {
      const convos = await this.chatService.listConversations(userId);
      res.json({ conversations: convos });
    } catch (err) {
      console.error('Error listing conversations:', err);
      res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.COMMON.ERROR.CHAT_LIST_FAILED });
    }
  }

  async markMessagesAsRead(req: AuthRequest, res: Response): Promise<void> {
    const participantId = req.user?.userId;
    const participantType = req.user?.type;
    const otherId = req.params.otherId;
    const eventId = req.params.eventId;

    if (!participantId || !participantType) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }

    try {
      await this.chatService.markMessagesAsRead(eventId, participantId, otherId);
      res.status(STATUS_CODES.SUCCESS).json({ message: 'Messages marked as read' });
    } catch (err) {
      console.error('Error marking messages as read:', err);
      res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Failed to mark messages as read' });
    }
  }
}