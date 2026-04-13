import { apiRequest } from './client';
import type { ApiResponse } from '@/types';

export interface PaymentInitPayload {
  orderId: string;
  amount: number;
  currency?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  callback_url?: string;
  return_url?: string;
}

export const paymentsApi = {
  async initializePayment(payload: PaymentInitPayload) {
    return apiRequest<ApiResponse<{ checkout_url?: string; tx_ref?: string }>>('/payment/initialize', {
      method: 'POST',
      body: payload,
    });
  },

  async verifyPayment(txRef: string) {
    return apiRequest<ApiResponse<any>>('/payment/verify', {
      method: 'POST',
      body: { tx_ref: txRef },
    });
  },

  async getTransactions() {
    return apiRequest<ApiResponse<{ transactions: any[] }>>('/transactions');
  },

  async getTransactionByRef(txRef: string) {
    return apiRequest<ApiResponse<{ transaction: any }>>(`/transactions/${txRef}`);
  },
};
