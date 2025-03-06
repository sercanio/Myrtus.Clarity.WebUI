import { NotificationPreference } from "./notification";
import { Role } from "./role";

export interface UserInfo {
    id: string;
    email: string;            
    userName: string;         
    roles: Role[];
    avatarUrl?: string;
    notificationPreference: NotificationPreference;
}