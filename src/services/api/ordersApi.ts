import { apiRequest } from './client';
import type { ApiResponse, Order, MarketplaceOrderCreatePayload } from '@/types';

export interface OrderProposalPayload {
  proposedPrice: number;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export const ordersApi = {
  // Marketplace
  async getMarketplaceOrders() {
    return apiRequest<ApiResponse<{ orders: Order[] }>>('/orders/marketplace');
  },

  async getMyOrders() {
    return apiRequest<ApiResponse<{ orders: Order[] }>>('/orders/mine');
  },

  async createMarketplaceOrder(payload: MarketplaceOrderCreatePayload) {
    return apiRequest<ApiResponse<{ order: Order }>>('/orders/marketplace', {
      method: 'POST',
      body: payload,
    });
  },

  // Order assignment (operator/admin)
  async assignOrder(orderId: string, driverId: string, vehicleId: string) {
    return apiRequest<ApiResponse<any>>(`/orders/${orderId}/assign`, {
      method: 'POST',
      body: { driverId, vehicleId },
    });
  },

  // Proposals
  async submitProposal(orderId: string, payload: OrderProposalPayload) {
    return apiRequest<ApiResponse<any>>(`/orders/${orderId}/proposals`, {
      method: 'POST',
      body: payload,
    });
  },

  async getProposals(orderId: string) {
    return apiRequest<ApiResponse<{ proposals: any[] }>>(`/orders/${orderId}/proposals`);
  },

  async getMyProposals() {
    return apiRequest<ApiResponse<{ proposals: any[] }>>('/orders/proposals/mine');
  },

  async acceptProposal(orderId: string, proposalId: string) {
    return apiRequest<ApiResponse<any>>(`/orders/${orderId}/proposals/${proposalId}/accept`, {
      method: 'PATCH',
    });
  },

  async rejectProposal(orderId: string, proposalId: string) {
    return apiRequest<ApiResponse<any>>(`/orders/${orderId}/proposals/${proposalId}/reject`, {
      method: 'PATCH',
    });
  },
};
