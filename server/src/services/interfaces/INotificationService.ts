import { CreateNotificationDto, NotificationResponseDto } from "../../dtos/notification/NotificationDTO";

export interface INotificationService {
  notifyMultipleUsers(
    dtos: CreateNotificationDto[]
  ): Promise<NotificationResponseDto[]>;
  listForUser(userId: string): Promise<NotificationResponseDto[]>
  getUnreadCount(userId: string): Promise<number>
  markRead(notificationId: string): Promise<void>
}
