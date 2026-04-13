import { apiRequest } from './client';
import type { ApiResponse, Company, CreateCompanyData } from '@/types';

export const companyApi = {
  async getCompanies() {
    const res = await apiRequest<{ status: string; data: { companies: Company[] } }>('/company');
    return res.data?.companies || [];
  },

  async getCompanyById(id: string) {
    const res = await apiRequest<{ status: string; data: { company: Company } }>(`/company/${id}`);
    return res.data.company;
  },

  async createCompany(data: CreateCompanyData) {
    return apiRequest<ApiResponse<{ company: Company }>>('/company', {
      method: 'POST',
      body: data,
      isFormData: true,
    });
  },

  async updateCompany(id: string, data: Partial<CreateCompanyData>) {
    return apiRequest<ApiResponse<{ company: Company }>>(`/company/${id}`, {
      method: 'PATCH',
      body: data,
      isFormData: true,
    });
  },

  async deleteCompany(id: string) {
    return apiRequest(`/company/${id}`, { method: 'DELETE' });
  },

  async approveCompany(id: string) {
    return apiRequest<ApiResponse<{ company: Company }>>(`/company/${id}/approve`, {
      method: 'PUT',
    });
  },

  async approveUser(userId: string) {
    return apiRequest<ApiResponse<any>>(`/company/users/${userId}/approve`, {
      method: 'PUT',
    });
  },
};
