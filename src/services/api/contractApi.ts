import { apiRequest } from './client';
import type { ApiResponse, Contract } from '@/types';

export interface ContractInitiatePayload {
  vendorId?: string;
  companyId?: string;
  terms?: string;
  notes?: string;
}

export const contractApi = {
  async initiateContract(payload: ContractInitiatePayload) {
    return apiRequest<ApiResponse<{ contract: Contract }>>('/contract/initiate', {
      method: 'POST',
      body: payload,
    });
  },

  async getVendorContracts() {
    return apiRequest<ApiResponse<{ contracts: Contract[] }>>('/contract/vendor');
  },

  async getCompanyContracts(params?: { status?: string; companyId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.companyId) query.append('companyId', params.companyId);
    const url = query.toString() ? `/contract/company?${query.toString()}` : '/contract/company';
    return apiRequest<ApiResponse<{ contracts: Contract[] }>>(url);
  },

  async approveContract(id: string) {
    return apiRequest<ApiResponse<{ contract: Contract }>>(`/contract/${id}/approve`, { method: 'PUT' });
  },

  async terminateContract(id: string) {
    return apiRequest<ApiResponse<{ contract: Contract }>>(`/contract/${id}/terminate`, { method: 'PUT' });
  },
};
