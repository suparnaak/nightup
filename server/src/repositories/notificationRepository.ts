import { Types } from "mongoose";
import NotificationModel, { INotification } from "../models/notifications";
import { INotificationRepository } from "./interfaces/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  


  async createMany(notifications: Partial<INotification>[]): Promise<INotification[]> {
    const result = await NotificationModel.insertMany(notifications);
    return result as INotification[];
  }
  async findByUser(userId: string): Promise<INotification[]> {
  return await NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
}

async countUnread(userId: string): Promise<number> {
  return await NotificationModel.countDocuments({ user: userId, read: false });
}

async markAsRead(notificationId: string): Promise<void> {
  await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } });
}

}