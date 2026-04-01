# Role-Based Authentication & Dashboard Implementation Guide

## Overview

This document outlines the implementation of role-based authentication and custom dashboards for the Fleet Command Center application. The system now supports multiple user roles with unique dashboards, approval workflows, and access controls.

## Implemented Components

### 1. **Authentication Context Enhancement** (`src/context/AuthContext.tsx`)

**Changes Made:**
- Added `userRole` state to track the current user's role
- Updated `AuthContextType` interface to include `userRole: UserRole | null`
- Enhanced `login`, `signup`, and `refreshUser` functions to set `userRole` from the authenticated user
- Exported `userRole` in the context provider value

**Usage:**
```typescript
const { user, userRole, isAuthenticated, login, signup, logout } = useAuth();
```

### 2. **User Type Enhancement** (`src/types/index.ts`)

**Changes Made:**
- Added `isApproved?: boolean` property to the `User` interface for tracking approval status
- This field is used for roles that require admin approval (e.g., OPERATOR)

**Supported User Roles:**
- `SHIPPER` - Initiates and manages shipments
- `VENDOR` - External service providers
- `DRIVER` - Operates vehicles and handles transportation
- `COMPANY_ADMIN` - Manages company-specific settings
- `PRIVATE_TRANSPORTER` - Individual transportation service providers
- `BROKER` - Facilitates connections between shippers and transporters
- `SUPER_ADMIN` - System administrator with full access

### 3. **Processing/Approval Page** (`src/features/auth/ProcessingPage.tsx`)

**Features:**
- Displays different states based on user approval status:
  - **Pending**: Shows a message that the application is being reviewed (up to 48 hours) with email notification info
  - **Approved**: Congratulates the user and prompts email confirmation
  - **Rejected**: Displays rejection message and support contact info
  - **Unknown**: Shows error message

- Polls approval status every 30 seconds when pending
- Automatically redirects to dashboard when approved
- Maintains the application's theme and styling

**Route:** `/processing`

### 4. **Protected Route Enhancement** (`src/routes/ProtectedRoute.tsx`)

**Changes Made:**
- Added role-based redirection logic
- Checks if user is an OPERATOR with `isApproved = false`
- Redirects unapproved operators to `/processing` page
- Maintains existing loading and authentication checks

**Flow:**
```
User Login
    ↓
Check Authentication
    ↓
Check Role & Approval Status
    ↓
OPERATOR + Not Approved → /processing
OPERATOR + Approved → /dashboard
Other Roles → /dashboard
Not Authenticated → /login
```

### 5. **Auth Page Refactoring** (`src/pages/Auth.tsx`)

**Changes Made:**
- Integrated with `useAuth` hook for centralized auth management
- Removed dependency on `authReducer` and `Supabase` direct calls
- Simplified role selection to "Passenger" (SHIPPER) and "Operator" (OPERATOR)
- Added automatic role-based redirection after login/signup
- Improved error handling with local state

**Role Mapping:**
- "Passenger" → `SHIPPER`
- "Operator" → `OPERATOR`

### 6. **Role-Based Dashboard Router** (`src/features/dashboard/RoleDashboardRouter.tsx`)

**Purpose:** Central component that routes users to their role-specific dashboard

**Role Mappings:**
- `SHIPPER` → ShipperDashboard
- `OPERATOR` → OperatorDashboard
- `DRIVER` → DriverDashboard
- `BROKER` → BrokerDashboard
- `SUPER_ADMIN` → AdminDashboard
- `COMPANY_ADMIN` → OperatorDashboard
- `VENDOR` → DefaultDashboard
- `PRIVATE_TRANSPORTER` → OperatorDashboard
- Default → DefaultDashboard

### 7. **Role-Specific Dashboards**

#### **ShipperDashboard** (`src/features/dashboard/roles/ShipperDashboard.tsx`)

**Features:**
- Active shipments tracking
- Completed orders overview
- Total spending metrics
- Quick actions: New Shipment, Track Order, Payments, Contracts
- Recent orders list with status and cost
- Performance overview (on-time delivery, avg. delivery time, cost savings)

**Color Theme:** Blue accent

#### **OperatorDashboard** (`src/features/dashboard/roles/OperatorDashboard.tsx`)

**Features:**
- Active vehicles count
- Monthly revenue tracking
- Pending payments overview
- Maintenance alerts
- Quick actions: Add Vehicle, Add Driver, Track Fleet, View Payments
- Fleet status breakdown (Active, Inactive, Maintenance)
- Revenue breakdown by trip status
- Performance metrics (trip duration, fleet utilization, fuel efficiency, safety rating)

**Color Theme:** Orange accent

#### **DriverDashboard** (`src/features/dashboard/roles/DriverDashboard.tsx`)

**Features:**
- Current trip information with real-time details
- Today's statistics (trips completed, earnings, rating, hours worked)
- Trip earnings display
- Quick actions: View Map, Trip History, Earnings, Report Issue
- Notifications for new trips and bonuses
- Navigation integration

**Color Theme:** Green accent

#### **BrokerDashboard** (`src/features/dashboard/roles/BrokerDashboard.tsx`)

**Features:**
- Active connections count
- Total commission tracking
- Successful matches overview
- Pending matches alerts
- Quick actions: New Match, View Network, Analytics, Payments
- Network status visualization (Shippers, Operators, Drivers)
- Recent matches with status and commission
- Commission breakdown and success rate

**Color Theme:** Purple accent

#### **AdminDashboard** (`src/features/dashboard/roles/AdminDashboard.tsx`)

**Features:**
- Total users count
- Pending approvals (highlighted)
- Active operators tracking
- Total revenue overview
- System health status
- Admin controls: Manage Users, Review Approvals, View Analytics, System Settings, Security & Logs
- Pending approvals list with approve/reject buttons
- System status monitoring (API, Database, Payment Gateway, Email Service)
- Recent activity log

**Color Theme:** Red accent

#### **DefaultDashboard** (`src/features/dashboard/roles/DefaultDashboard.tsx`)

**Purpose:** Fallback dashboard for roles without specific implementation

**Features:**
- Welcome message
- User profile information display
- Role and status information

### 8. **Updated Dashboard Page** (`src/features/dashboard/DashboardPage.tsx`)

**Changes Made:**
- Simplified to use `RoleDashboardRouter` component
- Removed hardcoded dashboard content
- Now dynamically renders appropriate dashboard based on user role

## Authentication Flow

### Login Flow

```
1. User enters credentials
2. Auth context calls login API
3. User data with role is stored
4. useEffect triggers handleRoleRedirect
5. Based on role and approval status:
   - OPERATOR + Not Approved → /processing
   - SUPER_ADMIN → /admin (future implementation)
   - All others → /dashboard
```

### Signup Flow

```
1. User selects role (Passenger/Operator)
2. Fills in required information
3. Auth context calls signup API
4. User data is stored
5. Same redirection logic as login
6. If OPERATOR: User sees processing page while admin reviews
```

### Approval Workflow

```
1. Operator signs up → isApproved = false
2. ProtectedRoute redirects to /processing
3. ProcessingPage polls approval status every 30 seconds
4. Admin approves in AdminDashboard
5. Backend updates user.isApproved = true
6. ProcessingPage detects change
7. User is redirected to /dashboard
8. User can now access full application
```

## Configuration & Environment Variables

Ensure the following environment variables are set:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Backend Requirements

### User Model Updates

The backend should include:

```typescript
interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole; // SHIPPER, OPERATOR, DRIVER, etc.
  status: UserStatus; // ACTIVE, PENDING, SUSPENDED, REJECTED
  isApproved?: boolean; // For roles requiring approval
  // ... other fields
}
```

### API Endpoints

**Required endpoints:**

- `POST /users/login` - User login
- `POST /users/signup` - User registration
- `GET /users/check-auth` - Verify current session
- `POST /users/logout` - User logout
- `PATCH /users/:id/approve` - Admin approval endpoint (for future implementation)

### Database Considerations

1. Add `is_approved` column to users table
2. Create approval workflow tracking (optional)
3. Add audit logs for admin actions

## Testing Checklist

- [ ] User can login with existing credentials
- [ ] User can signup with Passenger role
- [ ] User can signup with Operator role
- [ ] Operator signup redirects to /processing
- [ ] Processing page shows pending message initially
- [ ] Processing page polls status every 30 seconds
- [ ] Admin can approve operator in AdminDashboard
- [ ] Approved operator is redirected to dashboard
- [ ] Each role sees their specific dashboard
- [ ] Dashboard displays correct role-specific information
- [ ] User can logout from any dashboard
- [ ] Protected routes redirect unauthenticated users to /login

## Future Enhancements

1. **Admin Approval Interface**: Build comprehensive admin panel for reviewing and approving applications
2. **Email Notifications**: Send emails to users when their application is approved/rejected
3. **Role Management**: Allow admins to change user roles
4. **Approval Analytics**: Track approval metrics and timelines
5. **Custom Workflows**: Support different approval workflows for different roles
6. **Audit Logging**: Comprehensive logging of all admin actions
7. **Marketplace Dashboard**: Implement the marketplace as default loading screen (per user preference)

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx (Enhanced)
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── ProcessingPage.tsx (New)
│   └── dashboard/
│       ├── DashboardPage.tsx (Updated)
│       ├── RoleDashboardRouter.tsx (New)
│       └── roles/
│           ├── ShipperDashboard.tsx (New)
│           ├── OperatorDashboard.tsx (New)
│           ├── DriverDashboard.tsx (New)
│           ├── BrokerDashboard.tsx (New)
│           ├── AdminDashboard.tsx (New)
│           └── DefaultDashboard.tsx (New)
├── routes/
│   └── ProtectedRoute.tsx (Enhanced)
├── types/
│   └── index.ts (Enhanced)
└── pages/
    └── Auth.tsx (Refactored)
```

## Deployment Notes

1. Ensure all new components are properly imported in `App.tsx`
2. Update backend API endpoints to support new approval workflow
3. Configure email service for approval notifications
4. Test role-based access across all browsers
5. Monitor performance of polling mechanism in ProcessingPage

## Support & Troubleshooting

**Issue:** User stuck on processing page
- **Solution:** Check backend for user.isApproved status, manually update if needed

**Issue:** Role not displaying correct dashboard
- **Solution:** Verify user.role in database matches UserRole enum, check RoleDashboardRouter mapping

**Issue:** Polling not detecting approval
- **Solution:** Verify backend is updating isApproved field, check network requests in browser console

---

**Last Updated:** April 1, 2026
**Version:** 1.0.0
