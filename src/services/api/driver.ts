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

  // Isolated: endpoint ambiguity — {id} may be company or driver ID. 
  // Currently using company/{id}/drivers as PATCH target.
  async updateDriver(id: string, data: UpdateDriverData) {
    return apiRequest<ApiResponse<{ driver: Driver }>>(`/company/${id}/drivers`, {
      method: 'PATCH',
      body: data,
      isFormData: true,
    });
  },
};
