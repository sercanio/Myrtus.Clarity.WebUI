const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserInfo {
  id: string;
  email: string;
  userName: string;
  roles: string[];
  avatarUrl?: string;
  notificationPreference: {
    isInAppNotificationEnabled: boolean;
    isEmailNotificationEnabled: boolean;
    isPushNotificationEnabled: boolean;
  };
}

export class ApiService {
  static async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getCurrentUser(): Promise<UserInfo> {
    return this.fetchWithAuth<UserInfo>('/Account/me');
  }
}