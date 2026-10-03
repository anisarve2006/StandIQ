import { fetchApi } from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any): Promise<User> => {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refresh: async (): Promise<RefreshResponse> => {
    // Requires credentials to send HttpOnly cookie
    return fetchApi<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'No-Retry': 'true' // Don't intercept 401 on the refresh call itself
      }
    });
  },

  logout: async (): Promise<void> => {
    return fetchApi<void>('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchApi<User>('/auth/me', {
      method: 'GET',
    });
  },
};
