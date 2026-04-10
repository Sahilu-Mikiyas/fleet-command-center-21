import { apiRequest } from './client';
import type { ApiResponse } from '@/types';

export interface BrokerAssignPayload {
  orderId: string;
  assignmentMode: 'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER';
  targetCompanyId?: string;
  targetTransporterId?: string;
}

export const brokerApi = {
  assignOrder(payload: BrokerAssignPayload) {
    return apiRequest<ApiResponse<{ order: any }>>('/broker/assign', {
      method: 'POST',
      body: payload,
    });
  },

  matchCandidates(orderId: string) {
    return apiRequest<ApiResponse<{ candidates: any[]; order: any }>>(`/broker/match/${orderId}`);
  },

  validateOrder(orderId: string, autoTriggered = true) {
    return apiRequest<ApiResponse<{ order: any }>>(`/broker/orders/${orderId}/validate`, {
      method: 'PUT',
      body: { autoTriggered },
    });
  },

  assignVehicle(orderId: string, vehicleId: string) {
    return apiRequest<ApiResponse<{ order: any }>>(`/broker/orders/${orderId}/assign-vehicle`, {
      method: 'POST',
      body: { vehicleId },
    });
  },
};
