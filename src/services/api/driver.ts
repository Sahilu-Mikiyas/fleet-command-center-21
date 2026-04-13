import { apiRequest } from './client';
import type { ApiResponse, Driver, CreateDriverData, UpdateDriverData } from '@/types';

export const driverApi = {
  // Company driver management
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

  async updateDriver(companyId: string, data: UpdateDriverData) {
    return apiRequest<ApiResponse<{ driver: Driver }>>(`/company/${companyId}/drivers`, {
      method: 'PATCH',
      body: data,
      isFormData: true,
    });
  },

  // Driver self-service
  async getAssignments() {
    const res = await apiRequest<{ status: string; data: { assignments: any[] } }>('/driver/assignments');
    return res.data?.assignments || [];
  },

  async updateStatus(status: string, isAvailable?: boolean) {
    return apiRequest<ApiResponse<any>>('/driver/status', {
      method: 'PATCH',
      body: { status, isAvailable },
    });
  },

  // Assignment lifecycle
  async acceptAssignment(orderId: string) {
    return apiRequest<ApiResponse<any>>(`/driver/assignments/${orderId}/accept`, { method: 'PATCH' });
  },

  async rejectAssignment(orderId: string) {
    return apiRequest<ApiResponse<any>>(`/driver/assignments/${orderId}/reject`, { method: 'PATCH' });
  },

  async startAssignment(orderId: string) {
    return apiRequest<ApiResponse<any>>(`/driver/assignments/${orderId}/start`, { method: 'PATCH' });
  },

  async arriveAtPickup(orderId: string) {
    return apiRequest<ApiResponse<any>>(`/driver/assignments/${orderId}/arrive`, { method: 'PATCH' });
  },

  async completeAssignment(orderId: string) {
    return apiRequest<ApiResponse<any>>(`/driver/assignments/${orderId}/complete`, { method: 'PATCH' });
  },

  // Evidence & OTP
  async uploadEvidence(tripId: string, data: FormData) {
    return apiRequest<ApiResponse<any>>(`/driver/trips/${tripId}/evidence`, {
      method: 'POST',
      body: data,
      isFormData: true,
    });
  },

  async verifyOtp(tripId: string, otp: string) {
    return apiRequest<ApiResponse<any>>(`/driver/trips/${tripId}/verify-otp`, {
      method: 'POST',
      body: { otp },
    });
  },

  // Location
  async streamLocation(lat: number, lng: number) {
    return apiRequest<ApiResponse<any>>('/driver/location', {
      method: 'POST',
      body: { lat, lng },
    });
  },

  // Commission
  async getCommission() {
    return apiRequest<ApiResponse<any>>('/driver/commission');
  },

  async getCommissionHistory() {
    return apiRequest<ApiResponse<any>>('/driver/commission/history');
  },

  // Trip history
  async getTripHistory() {
    return apiRequest<ApiResponse<any>>('/driver/trips/history');
  },

  // Vehicle assignment
  async assignVehicle(vehicleId: string) {
    return apiRequest<ApiResponse<any>>('/driver/vehicles/assign', {
      method: 'POST',
      body: { vehicleId },
    });
  },

  async unassignVehicle() {
    return apiRequest<ApiResponse<any>>('/driver/vehicles/unassign', { method: 'POST' });
  },

  async reassignVehicle(vehicleId: string) {
    return apiRequest<ApiResponse<any>>('/driver/vehicles/reassign', {
      method: 'POST',
      body: { vehicleId },
    });
  },
};
