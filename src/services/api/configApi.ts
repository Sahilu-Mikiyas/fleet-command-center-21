import { apiRequest } from './client';
import type { ApiResponse } from '@/types';

export const configApi = {
  async getCommissionConfig() {
    return apiRequest<ApiResponse<any>>('/config/commission');
  },

  async updateCommissionConfig(payload: any) {
    return apiRequest<ApiResponse<any>>('/config/commission', {
      method: 'PATCH',
      body: payload,
    });
  },

  async getPricingConfig() {
    return apiRequest<ApiResponse<any>>('/pricing-config');
  },

  async updatePricingConfig(payload: any) {
    return apiRequest<ApiResponse<any>>('/pricing-config', {
      method: 'PUT',
      body: payload,
    });
  },
};
