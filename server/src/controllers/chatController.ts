import { Request, Response } from 'express';
import ChatService from '../services/chatService';
import { IChatController } from './interfaces/IChatController';

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class ChatController implements IChatController {
  
  async fetchMessages(req: AuthRequest, res: Response): Promise<void> {
    const participantId = req.user?.userId;
    const participantType = req.user?.type;
    const otherId = req.params.otherId;
    const eventId = req.params.eventId;

    if (!participantId || !participantType) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    try {
      const messages = await ChatService.fetchMessages(
        eventId,
        participantId,
        participantType,
        otherId,
        participantType === 'user' ? 'host' : 'user'
      );
      res.status(200).json({ messages });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  }

 
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const senderId = req.user?.userId;
    const senderType = req.user?.type;
    const receiverId = req.params.otherId;
    const eventId = req.params.eventId;
    const { content } = req.body;

    if (!senderId || !senderType) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Message content is required' });
      return;
    }

    try {
      const message = await ChatService.sendMessage(
        eventId,
        senderId,
        senderType,
        receiverId,
        senderType === 'user' ? 'host' : 'user',
        content.trim()
      );
      res.status(201).json({ message });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Failed to send message' });
    }
  }

  async listConversations(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const userType = req.user?.type;
    
    if (!userId || !userType) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    try {
      const convos = await ChatService.listConversations(userId);
      res.json({ conversations: convos });
    } catch (err) {
      console.error('Error listing conversations:', err);
      res.status(500).json({ message: 'Failed to list conversations' });
    }
  }


}

export default new ChatController();