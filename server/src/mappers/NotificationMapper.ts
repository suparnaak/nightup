import { INotification } from "../models/notifications";
import {
  NotificationResponseDto,
  CreateNotificationDto,
} from "../dtos/notification/NotificationDTO";
import { Types } from "mongoose";


export function toNotificationModel(dto: CreateNotificationDto) {
  return {
    user: new Types.ObjectId(dto.user),
    event: new Types.ObjectId(dto.event),
    message: dto.message,
    read: false,
    createdAt: new Date(),
  };
}

export function toNotificationResponseDto(
  notification: INotification
): NotificationResponseDto {
  return {
    notificationId: notification._id.toHexString(),
    user: notification.user.toHexString(),
    event: notification.event.toHexString(),
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
  };
}