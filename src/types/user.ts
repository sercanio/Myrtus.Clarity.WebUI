import { NotificationPreference } from "./notification";
import { Role } from "./role";
import { ValueObject } from "./valueObject";

export interface UserInfo {
  id: string;
  email: ValueObject<string>;
  firstName: ValueObject<string>;
  lastName: ValueObject<string>;
  roles: Role[];
  avatarUrl?: string;
  notificationPreference: NotificationPreference;
}