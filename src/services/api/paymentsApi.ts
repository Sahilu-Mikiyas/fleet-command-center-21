import { apiRequest } from './client';

export interface ChapaPaymentPayload {
  amount: number;
  currency: 'ETB' | 'USD';
  email: string;
  first_name: string;
  last_name: string;
  callback_url: string;
  return_url?: string;
  description?: string;
}

export const paymentsApi = {
  initializeChapa(payload: ChapaPaymentPayload) {
    return apiRequest<{ checkout_url: string }>('/payments/chapa', {
      method: 'POST',
      body: payload,
    });
  },
};
