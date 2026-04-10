import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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

// Placeholder pages
import MarketplacePage from "@/features/marketplace/MarketplacePage";
import ContractsPage from "@/features/contracts/ContractsPage";
import TrackingPage from "@/features/tracking/TrackingPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import BrokerPage from "@/features/broker/BrokerPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const LAYOUT_ALLOWED_ROLES: UserRole[] = [
  'SHIPPER',
  'VENDOR',
  'DRIVER',
  'COMPANY_ADMIN',
  'PRIVATE_TRANSPORTER',
  'BROKER',
  'SUPER_ADMIN',
  'OPERATOR',
  'ADMIN',
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/processing" element={<ProcessingPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={LAYOUT_ALLOWED_ROLES}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/orders" element={<MarketplacePage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/broker" element={<BrokerPage />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
