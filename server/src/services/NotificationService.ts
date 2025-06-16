import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { INotificationService } from "./interfaces/INotificationService";
import { INotificationRepository } from "../repositories/interfaces/INotificationRepository"
import { toNotificationModel, toNotificationResponseDto } from "../mappers/NotificationMapper";
import { CreateNotificationDto, NotificationResponseDto } from "../dtos/notification/NotificationDTO"
import { io } from "../config/SocketServer";
import TYPES from '../config/di/types';

@injectable()
export class NotificationService implements INotificationService {
  //constructor(private repository: INotificationRepository) {}
  constructor(
      @inject(TYPES.NotificationRepository)
      private notificationRepository: INotificationRepository,
      
    ){}

  
  async notifyMultipleUsers(dtos: CreateNotificationDto[]): Promise<NotificationResponseDto[]> {
    const payloads = dtos.map(dto => toNotificationModel(dto));
    const savedNotifications = await this.notificationRepository.createMany(payloads as any[]);
    
    const responseDtos = savedNotifications.map(toNotificationResponseDto);
    
    // Emit to all users via Socket.IO
    responseDtos.forEach(respDto => {
      io.to(`user-${respDto.user}`).emit("eventNotification", {
        notificationId: respDto.notificationId,
        user: respDto.user,
        event: respDto.event,
        message: respDto.message,
        read: respDto.read,
        createdAt: respDto.createdAt,
      });
    });
    
    return responseDtos;
  }
  async listForUser(userId: string): Promise<NotificationResponseDto[]> {
  const notifications = await this.notificationRepository.findByUser(userId);
  return notifications.map(toNotificationResponseDto);
}

// Count unread notifications for a specific user
async getUnreadCount(userId: string): Promise<number> {
  return await this.notificationRepository.countUnread(userId);
}

// Mark a notification as read by ID
async markRead(notificationId: string): Promise<void> {
  await this.notificationRepository.markAsRead(notificationId);
}
}
