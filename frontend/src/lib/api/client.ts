import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '../auth/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API] Adding auth token to ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.error('[API] ERROR: No auth token available for request to', config.url);
    console.error('[API] All localStorage keys:', Object.keys(localStorage));
    // Check if token key exists
    const hasAccessTokenKey = localStorage.getItem('weatherops_access_token') !== null;
    console.error('[API] weatherops_access_token exists:', hasAccessTokenKey);
  }
  return config;
});

// Response interceptor: Handle token refresh on 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          // No refresh token, redirect to login
          tokenManager.clearTokens();
          window.location.href = '/#login';
          return Promise.reject(error);
        }

        // Call refresh endpoint (without auth header, uses refresh token in body)
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { baseURL: '' } // Don't use the default base URL for this call
        );

        if (response.status === 200) {
          const { access_token, refresh_token } = response.data;
          tokenManager.setTokens(access_token, refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/#login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
