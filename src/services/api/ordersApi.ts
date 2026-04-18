import { apiRequest } from './client';
import type { ApiResponse, Order, MarketplaceOrderCreatePayload } from '@/types';

export interface OrderProposalPayload {
  proposedPrice: number;
  estimatedDeliveryDate?: string;
  notes?: string;
}

/**
 * Tolerant order list extractor.
 * The backend may wrap orders as:
 *   { status, data: { orders: [...] } }       (current spec)
 *   { status, data: [...] }
 *   { orders: [...] }
 *   [...]
 */
function extractOrders(raw: any): Order[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.orders)) return raw.orders;
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.data?.orders && Array.isArray(raw.data.orders)) return raw.data.orders;
  if (raw.data?.data?.orders && Array.isArray(raw.data.data.orders)) return raw.data.data.orders;
  if (raw.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  if (raw.results && Array.isArray(raw.results)) return raw.results;
  return [];
}

export const ordersApi = {
  // Marketplace
  async getMarketplaceOrders() {
    const raw = await apiRequest<any>('/orders/marketplace');
    return { status: 'success', data: { orders: extractOrders(raw) }, _raw: raw } as ApiResponse<{ orders: Order[] }> & { _raw: any };
  },

  async getMyOrders() {
    const raw = await apiRequest<any>('/orders/mine');
    return { status: 'success', data: { orders: extractOrders(raw) }, _raw: raw } as ApiResponse<{ orders: Order[] }> & { _raw: any };
  },

  async createMarketplaceOrder(payload: MarketplaceOrderCreatePayload) {
    return apiRequest<ApiResponse<{ order: Order }>>('/orders/marketplace', {
      method: 'POST',
      body: payload,
    });
  },

  async getOrderPublicStatus(orderId: string) {
    return apiRequest<ApiResponse<{ order: Order }> | { order: Order }>(`/orders/${orderId}`, {
      auth: false,
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
