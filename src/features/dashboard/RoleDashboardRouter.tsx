import { useAuth } from '@/context/AuthContext';
import ShipperDashboard from './roles/ShipperDashboard';
import OperatorDashboard from './roles/OperatorDashboard';
import DriverDashboard from './roles/DriverDashboard';
import BrokerDashboard from './roles/BrokerDashboard';
import AdminDashboard from './roles/AdminDashboard';
import DefaultDashboard from './roles/DefaultDashboard';

/**
 * RoleDashboardRouter component that renders different dashboards based on user role
 */
export default function RoleDashboardRouter() {
  const { user, userRole } = useAuth();

  if (!user || !userRole) {
    return <DefaultDashboard />;
  }

  switch (userRole) {
    case 'SHIPPER':
      return <ShipperDashboard />;
    case 'OPERATOR':
      return <OperatorDashboard />;
    case 'DRIVER':
      return <DriverDashboard />;
    case 'BROKER':
      return <BrokerDashboard />;
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return <AdminDashboard />;
    case 'COMPANY_ADMIN':
      return <OperatorDashboard />; // Company admins see operator dashboard
    case 'VENDOR':
      return <DefaultDashboard />;
    case 'PRIVATE_TRANSPORTER':
      return <OperatorDashboard />; // Private transporters see operator dashboard
    default:
      return <DefaultDashboard />;
  }
}
