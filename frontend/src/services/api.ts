import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type ApiResponse, type LoginRequest, type AuthResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');

    // Request interceptor to add auth header
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          if (this.refreshToken) {
            try {
              const response = await this.refreshAccessToken();
              this.setTokens(response.data.access_token, response.data.refresh_token);
              original.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.api(original);
            } catch (refreshError) {
              this.clearTokens();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            this.clearTokens();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.access_token, response.data.data.refresh_token);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.api.post('/auth/logout', { refresh_token: this.refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  private async refreshAccessToken(): Promise<AxiosResponse<any>> {
    return axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
      { refresh_token: this.refreshToken }
    );
  }

  async getProfile(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Generic request methods
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/health`);
      return response.data;
    } catch (error) {
      throw new Error('Backend is not available');
    }
  }
}

export const apiService = new ApiService();