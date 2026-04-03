export interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  active: boolean;
  companyId?: string;
  isApproved?: boolean; // Added for roles requiring approval
  isAvailable?: boolean;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'SHIPPER'
  | 'VENDOR'
  | 'DRIVER'
  | 'COMPANY_ADMIN'
  | 'PRIVATE_TRANSPORTER'
  | 'BROKER'
  | 'SUPER_ADMIN'
  | 'OPERATOR'
  | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

export interface Company {
  _id: string;
  ownerId: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  website?: string;
  photo?: string;
  description?: string;
  numberOfCars: number;
  businessLicense?: string;
  address?: string;
  status: CompanyStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

export interface Vehicle {
  _id: string;
  companyId: string;
  plateNumber: string;
  vehicleType: string;
  model: string;
  capacityKg: number;
  status: VehicleStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Driver {
  _id: string;
  userId?: string;
  companyId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  licensePhoto?: string;
  driverPhoto?: string;
  status: DriverStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DriverStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

// Future extensible types
export interface Order {
  _id: string;
  status: string;
  // placeholder
}

export interface Contract {
  _id: string;
  status: string;
}

export interface Trip {
  _id: string;
  status: string;
}

export interface Payment {
  _id: string;
  status: string;
}

export interface LocationLog {
  _id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
  photo?: File;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export interface CreateCompanyData {
  companyName: string;
  email: string;
  phoneNumber: string;
  website?: string;
  description?: string;
  businessLicense?: string;
  address?: string;
  photo?: File;
}

export interface CreateVehicleData {
  plateNumber: string;
  vehicleType: string;
  model: string;
  capacityKg: number;
  status?: VehicleStatus;
}

export interface CreateDriverData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  licenseNumber: string;
  status?: DriverStatus;
  driverPhoto?: File;
  licensePhoto?: File;
}

export interface UpdateDriverData {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  licenseNumber?: string;
  status?: DriverStatus;
  driverPhoto?: File;
  licensePhoto?: File;
}
