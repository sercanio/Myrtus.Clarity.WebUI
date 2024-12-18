import { Role } from "./role";

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  avatarUrl?: string;
  notificationPreference: {
    isInAppNotificationEnabled: boolean;
    isEmailNotificationEnabled: boolean;
    isPushNotificationEnabled: boolean;
  };
}