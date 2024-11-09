const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  avatarUrl?: string;
}

export class ApiService {
  static async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getCurrentUser(): Promise<UserInfo> {
    return this.fetchWithAuth<UserInfo>('/accounts/me');
  }
} 