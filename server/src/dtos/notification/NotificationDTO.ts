export interface CreateNotificationDto {
  user: string;          
  event: string;         
  message: string;       
}

export interface NotificationResponseDto {
  notificationId: string;
  user: string;          
  event: string;         
  message: string;
  read: boolean;
  createdAt: string;     
}

export interface UpdateNotificationDto {
  read?: boolean;       
}