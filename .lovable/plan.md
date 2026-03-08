

# Intelligent Fleet Coordination & Delivery Automation Platform

## Overview
A premium logistics command center dashboard with a light theme, orange/amber accent palette, Framer Motion animations, and full backend integration with the provided API endpoints.

---

## Phase 1: Foundation & Design System

### Theme & Styling
- Light mode with orange/amber primary accents (warm gradients, glowing active states)
- Glassmorphism card accents, layered shadows, refined typography
- Custom CSS variables for the orange/amber palette across all components

### Add Framer Motion
- Install `framer-motion` for page transitions, staggered card entrances, animated counters, modal transitions, and layout animations

### Reusable Component Enhancements
- **StatCard** — animated KPI card with counter animation, accent glow, hover lift
- **StatusBadge** — color-coded chips for ACTIVE/PENDING/SUSPENDED/INACTIVE/MAINTENANCE with optional pulse
- **EmptyState** — illustrated placeholder with CTA
- **SkeletonCard / SkeletonTable** — shimmer loading states
- **FileUpload** — drag-and-drop dropzone with preview
- **SearchBar / FilterBar** — styled search + filter controls
- **DataTable** — reusable table with hover effects, sticky headers, loading/empty states, row actions
- **ConfirmDialog** — destructive action confirmation modal
- **PageTransition** — Framer Motion wrapper for route transitions

---

## Phase 2: App Shell & Layout

### Sidebar
- Collapsible sidebar with animated expand/collapse (icon-only mini mode)
- Grouped navigation: Operations (Dashboard, Company, Vehicles, Drivers), Future Modules (Orders, Contracts, Tracking, Payments, Analytics, Broker Ops), Settings
- Active route highlight with orange accent glow
- Tooltips in collapsed mode

### Top Bar
- Page title + breadcrumb trail
- Notification bell placeholder
- User avatar dropdown (profile, settings, logout)
- Responsive hamburger menu on mobile

### Auth-aware routing
- Protected route wrapper redirecting to login if unauthenticated
- Auth state restored on refresh via `check-auth` endpoint

---

## Phase 3: Authentication Pages

### Login Page
- Split layout: left branded hero panel with logistics-themed abstract visuals + floating gradient shapes, right login form card
- Email/phone input, password with show/hide toggle, "Forgot password?" link, sign-up link
- Sequential field entrance animations, button hover glow

### Sign Up Page
- Matching visual style to login
- Fields: full name, phone, email, password, confirm password, role selector (dropdown with all 7 roles), profile photo upload
- Multipart/form-data submission
- Animated upload dropzone, role select polish

### Forgot Password Page
- Compact centered card, email input, submit → success state morph animation

### Reset Password Page
- Token from URL, new password + confirm, submit → success check animation → login redirect

---

## Phase 4: API Layer & State Management

### Service Architecture
- `apiClient` — base fetch wrapper with auth token injection, JSON and FormData modes, centralized error parsing
- `authApi` — signup, login, logout, forgotPassword, resetPassword, updatePassword, checkAuth
- `companyApi` — CRUD operations
- `vehicleApi` — getCompanyVehicles, createVehicle
- `driverApi` — getCompanyDrivers, createDriver, updateDriver (isolated for the ambiguous endpoint)

### TanStack Query Hooks
- Custom hooks for each module: `useAuth`, `useCompanies`, `useVehicles`, `useDrivers`
- Proper loading/error states, query invalidation after mutations

### TypeScript Types
- Full interfaces for User, Company, Vehicle, Driver
- Extensible placeholder types for Order, Contract, Trip, Payment, LocationLog

---

## Phase 5: Main Dashboard

- Dynamic greeting with role/company context
- **KPI cards row** (animated counters): Total Vehicles, Total Drivers, Company Status, Pending Actions — with orange accent edges and staggered entrance
- **Fleet overview widget** — active vs inactive vehicles with progress bars
- **Driver overview widget** — status breakdown with colored chips
- **Quick actions card** — Create Company, Add Vehicle, Add Driver, Update Company buttons
- **Activity panel** — recent activity with graceful placeholders
- **Coming soon module teasers** — Live Tracking, Active Deliveries, Contracts, Payments — premium cards with "Integration Pending" messaging

---

## Phase 6: Company Profile Page

- Hero card with company photo/logo, name, status badge, contact info
- Stats strip: total cars, active status, profile completion
- Editable details form (read ↔ edit mode transition) with all company fields
- Photo upload with preview
- Deactivate company with confirmation dialog
- Multipart/form-data for create/update

---

## Phase 7: Vehicles Page

- Summary cards: total, active, inactive, maintenance (animated counters)
- Search by plate number/model, filter by status
- Data table with columns: plate number, vehicle type, model, capacity, status, active
- Add vehicle modal with form fields: plateNumber, vehicleType, model, capacityKg, status
- Elegant empty state when no vehicles

---

## Phase 8: Drivers Page

- Summary cards: total, active, pending, suspended
- Search by name/email/phone, filter by status
- Data table with avatar, full name, phone, email, license number, status, actions
- Add driver modal/form with photo and license upload (multipart/form-data)
- Edit driver form (isolated API call for the ambiguous endpoint)
- Optional driver detail side panel on row click

---

## Phase 9: Settings / Update Password

- Account summary card
- Update password form: currentPassword, password, passwordConfirm
- Success feedback animation
- Logout action

---

## Phase 10: Placeholder Future Module Pages

Premium scaffold pages for **Orders, Contracts, Tracking, Payments, Analytics, Broker Operations** — each with:
- Hero header with module icon and description
- Mock preview widgets and pipeline visuals
- "Backend integration pending" messaging
- Styled to feel intentional and presentation-ready, not empty

---

## Folder Structure
```
src/
├── components/ui/          # Enhanced shadcn + custom components
├── components/layout/      # Sidebar, TopBar, PageTransition
├── components/shared/      # StatCard, StatusBadge, DataTable, EmptyState, FileUpload
├── features/auth/          # Login, Signup, ForgotPassword, ResetPassword
├── features/dashboard/     # Main dashboard
├── features/company/       # Company profile & management
├── features/vehicles/      # Vehicle management
├── features/drivers/       # Driver management
├── features/settings/      # Settings & password update
├── features/placeholders/  # Future module pages
├── services/api/           # API clients & helpers
├── hooks/                  # TanStack Query hooks
├── types/                  # TypeScript interfaces
├── context/                # Auth context
├── routes/                 # Route config & protected routes
└── lib/                    # Utilities
```

