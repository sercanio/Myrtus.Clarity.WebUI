export interface Notification {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string;
    details: string;
    isRead: boolean;
}

export interface NotificationPreference {
    isInAppNotificationEnabled: boolean;
    isEmailNotificationEnabled: boolean;
    isPushNotificationEnabled: boolean;
}

export interface NotificationResponse {
  paginatedNotifications: PaginatedResponse<Notification>;
  unreadCount: number;
}