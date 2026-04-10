import { apiRequest } from './client';
import type { ApiResponse, Order, MarketplaceOrderCreatePayload } from '@/types';

export const ordersApi = {
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
};
