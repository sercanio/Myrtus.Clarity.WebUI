export interface Notification {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string;
    details: string;
    isRead: boolean;
}