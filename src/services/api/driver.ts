import { apiRequest } from './client';
import type { ApiResponse, Driver, CreateDriverData, UpdateDriverData } from '@/types';

export const driverApi = {
  async getCompanyDrivers(companyId: string) {
    const res = await apiRequest<{ status: string; data: { drivers: Driver[] } }>(`/company/${companyId}/drivers`);
    return res.data?.drivers || [];
  },

  async createDriver(companyId: string, data: CreateDriverData) {
    return apiRequest<ApiResponse<{ driver: Driver }>>(`/company/${companyId}/drivers`, {
      method: 'POST',
      body: data,
      isFormData: true,
    });
  },

  async updateDriver(id: string, data: UpdateDriverData) {
    return apiRequest<ApiResponse<{ driver: Driver }>>(`/company/${id}/drivers`, {
      method: 'PATCH',
      body: data,
      isFormData: true,
    });
  },

  async getAssignments() {
    const res = await apiRequest<{ status: string; data: { assignments: any[] } }>('/driver/assignments');
    return res.data?.assignments || [];
  },

  async updateStatus(status: string) {
    return apiRequest<ApiResponse<any>>('/driver/status', {
      method: 'PATCH',
      body: { status },
    });
  },
};
