import apiClient from './client';
import { tokenManager } from '../auth/tokenManager';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', {
      email,
      password,
    });

    // Store tokens
    const { access_token, refresh_token } = response.data;
    tokenManager.setTokens(access_token, refresh_token);

    return response.data;
  },

  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Store tokens
    const { access_token, refresh_token } = response.data;
    tokenManager.setTokens(access_token, refresh_token);

    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<LoginResponse> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;
    tokenManager.setAccessToken(access_token);

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear tokens regardless of response
      tokenManager.clearTokens();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenManager.isAuthenticated();
  },
};
