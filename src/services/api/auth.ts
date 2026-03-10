import { apiRequest, setToken, clearToken } from './client';
import type { AuthResponse, LoginCredentials, SignupData, ForgotPasswordData, ResetPasswordData, UpdatePasswordData, User } from '@/types';

export const authApi = {
  async login(credentials: LoginCredentials) {
    const res = await apiRequest<AuthResponse>('/users/login', {
      method: 'POST',
      body: credentials,
      auth: false,
    });
    if (res.token) setToken(res.token);
    return res;
  },

  async signup(data: SignupData) {
    const res = await apiRequest<AuthResponse>('/users/signup', {
      method: 'POST',
      body: data,
      isFormData: true,
      auth: false,
    });
    if (res.token) setToken(res.token);
    return res;
  },

  async logout() {
    try {
      await apiRequest('/users/logout');
    } finally {
      clearToken();
    }
  },

  async forgotPassword(data: ForgotPasswordData) {
    return apiRequest('/users/forgotPassword', {
      method: 'POST',
      body: data,
      auth: false,
    });
  },

  async resetPassword(token: string, data: ResetPasswordData) {
    return apiRequest(`/users/resetPassword/${token}`, {
      method: 'PATCH',
      body: data,
      auth: false,
    });
  },

  async updatePassword(data: UpdatePasswordData) {
    return apiRequest('/users/updatePassword', {
      method: 'PATCH',
      body: data,
    });
  },

  async checkAuth() {
    const res = await apiRequest<{ status: string; user?: User; data?: { user?: User } }>('/users/check-auth');
    return res.user ?? res.data?.user ?? null;
  },
};
