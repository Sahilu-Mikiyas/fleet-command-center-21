import { apiRequest } from './client';
import type { ApiResponse, Vehicle, CreateVehicleData } from '@/types';

export const vehicleApi = {
  async getCompanyVehicles() {
    const res = await apiRequest<{ status: string; data: { vehicles: Vehicle[] } }>('/company/vehicles');
    return res.data?.vehicles || [];
  },

  async createVehicle(data: CreateVehicleData) {
    return apiRequest<ApiResponse<{ vehicle: Vehicle }>>('/company/vehicles', {
      method: 'POST',
      body: data,
    });
  },
};
