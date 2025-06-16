import { INotification } from "../../models/notifications";

export interface INotificationRepository {
  createMany(notifications: Partial<INotification>[]): Promise<INotification[]>;
  findByUser(userId: string): Promise<INotification[]>
  countUnread(userId: string): Promise<number>
  markAsRead(notificationId: string): Promise<void>
 
}