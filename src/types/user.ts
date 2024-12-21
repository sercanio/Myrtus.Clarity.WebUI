import { NotificationPreference } from "./notification";
import { Role } from "./role";

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  avatarUrl?: string;
  notificationPreference: NotificationPreference
}