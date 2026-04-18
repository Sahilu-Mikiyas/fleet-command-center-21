import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { UserRole } from "@/types";

// Auth pages
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import ProcessingPage from "@/features/auth/ProcessingPage";

// Main pages
import DashboardPage from "@/features/dashboard/DashboardPage";
import CompanyPage from "@/features/company/CompanyPage";
import VehiclesPage from "@/features/vehicles/VehiclesPage";
import DriversPage from "@/features/drivers/DriversPage";
import SettingsPage from "@/features/settings/SettingsPage";

// Feature pages
import MarketplacePage from "@/features/marketplace/MarketplacePage";
import ContractsPage from "@/features/contracts/ContractsPage";
import TrackingPage from "@/features/tracking/TrackingPage";
import LiveTrackingPage from "@/features/tracking/LiveTrackingPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import BrokerPage from "@/features/broker/BrokerPage";
import OrdersPage from "@/features/orders/OrdersPage";
import ShipperOrdersPage from "@/features/orders/ShipperOrdersPage";
import VendorStatsPage from "@/features/vendor/VendorStatsPage";
import AnnouncementsPage from "@/features/announcements/AnnouncementsPage";
import DriverInspectionPage from "@/features/driver/DriverInspectionPage";
import DriverTripHistoryPage from "@/features/driver/DriverTripHistoryPage";
import DriverProfilePage from "@/features/driver/DriverProfilePage";
import DriverDocumentsPage from "@/features/driver/DriverDocumentsPage";
import CurrentTripPage from "@/features/driver/CurrentTripPage";
import LandingPage from "@/pages/LandingPage";
import PublicPaymentPage from "@/pages/PublicPaymentPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const ALL_ROLES: UserRole[] = ['SHIPPER', 'VENDOR', 'DRIVER', 'COMPANY_ADMIN', 'PRIVATE_TRANSPORTER', 'BROKER', 'SUPER_ADMIN', 'OPERATOR', 'ADMIN'];
const DRIVER_LIKE: UserRole[] = ['DRIVER', 'PRIVATE_TRANSPORTER'];
const SHIPPER_ONLY: UserRole[] = ['SHIPPER'];
const VENDOR_ONLY: UserRole[] = ['VENDOR'];
const FLEET_ADMINS: UserRole[] = ['COMPANY_ADMIN', 'OPERATOR', 'SUPER_ADMIN', 'ADMIN', 'PRIVATE_TRANSPORTER'];

function Roled({ roles, element }: { roles: UserRole[]; element: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/pay-order" element={<PublicPaymentPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute allowedRoles={ALL_ROLES}><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/company" element={<Roled roles={['COMPANY_ADMIN','OPERATOR','SUPER_ADMIN','ADMIN']} element={<CompanyPage />} />} />
              <Route path="/vehicles" element={<Roled roles={FLEET_ADMINS} element={<VehiclesPage />} />} />
              <Route path="/drivers" element={<Roled roles={FLEET_ADMINS} element={<DriversPage />} />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Orders: Shipper sees its own table, others see generic OrdersPage */}
              <Route path="/orders" element={
                <Roled roles={['SHIPPER','COMPANY_ADMIN','OPERATOR','SUPER_ADMIN','ADMIN','PRIVATE_TRANSPORTER','VENDOR']}
                  element={<ShipperOrdersOrGeneric />} />
              } />
              {/* Vendor split flows */}
              <Route path="/orders/contract" element={<Roled roles={VENDOR_ONLY} element={<OrdersPage />} />} />
              <Route path="/orders/marketplace" element={<Roled roles={VENDOR_ONLY} element={<MarketplacePage />} />} />

              <Route path="/marketplace" element={<MarketplacePage />} />
              {/* Contracts: NOT for SHIPPER */}
              <Route path="/contracts" element={<Roled roles={['VENDOR','COMPANY_ADMIN','OPERATOR','SUPER_ADMIN','ADMIN']} element={<ContractsPage />} />} />
              <Route path="/tracking" element={<LiveTrackingPage />} />
              <Route path="/legacy-tracking" element={<TrackingPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              {/* Broker: NOT for COMPANY_ADMIN */}
              <Route path="/broker" element={<Roled roles={['BROKER','OPERATOR','SUPER_ADMIN','ADMIN']} element={<BrokerPage />} />} />

              {/* Vendor */}
              <Route path="/stats" element={<Roled roles={VENDOR_ONLY} element={<VendorStatsPage />} />} />

              {/* Announcements */}
              <Route path="/announcements" element={<Roled roles={SHIPPER_ONLY} element={<AnnouncementsPage />} />} />

              {/* Driver / Private Transporter pages */}
              <Route path="/inspection" element={<Roled roles={DRIVER_LIKE} element={<DriverInspectionPage />} />} />
              <Route path="/trip-history" element={<Roled roles={DRIVER_LIKE} element={<DriverTripHistoryPage />} />} />
              <Route path="/profile" element={<Roled roles={DRIVER_LIKE} element={<DriverProfilePage />} />} />
              <Route path="/documents" element={<Roled roles={DRIVER_LIKE} element={<DriverDocumentsPage />} />} />
              <Route path="/current-trip" element={<Roled roles={DRIVER_LIKE} element={<CurrentTripPage />} />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Wrapper that picks ShipperOrdersPage for SHIPPER, generic OrdersPage otherwise
function ShipperOrdersOrGeneric() {
  const { userRole } = useAuth();
  if (userRole === 'SHIPPER') return <ShipperOrdersPage />;
  return <OrdersPage />;
}

export default App;
