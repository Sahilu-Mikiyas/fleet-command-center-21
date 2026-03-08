import { Package, FileText, MapPin, CreditCard, BarChart3, Shield } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function OrdersPage() {
  return (
    <PlaceholderPage
      title="Orders"
      description="Manage shipment orders, track delivery pipelines, and monitor order lifecycle from creation to completion."
      icon={Package}
      widgets={[
        { title: 'Order Pipeline', description: 'Track orders through stages: Created → Assigned → In Transit → Delivered' },
        { title: 'Shipment Analytics', description: 'Delivery success rates, average transit times, and volume metrics' },
        { title: 'Order History', description: 'Complete audit trail of all orders with status filtering' },
      ]}
    />
  );
}

export function ContractsPage() {
  return (
    <PlaceholderPage
      title="Contracts"
      description="Manage vendor agreements, transporter contracts, and approval workflows for your logistics operations."
      icon={FileText}
      widgets={[
        { title: 'Active Contracts', description: 'View and manage all active vendor and transporter agreements' },
        { title: 'Approval Queue', description: 'Review pending contract approvals and amendments' },
        { title: 'Contract Analytics', description: 'Contract value tracking, renewal alerts, and compliance metrics' },
      ]}
    />
  );
}

export function TrackingPage() {
  return (
    <PlaceholderPage
      title="Live Tracking"
      description="Real-time GPS monitoring of your entire fleet with route visualization and geofencing capabilities."
      icon={MapPin}
      widgets={[
        { title: 'Fleet Map', description: 'Live GPS positions of all active vehicles on an interactive map' },
        { title: 'Route History', description: 'Playback historical routes and analyze driver behavior' },
        { title: 'Geofencing', description: 'Set up zone alerts and automated notifications for fleet boundaries' },
      ]}
    />
  );
}

export function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Payments"
      description="Manage escrow payments, driver payouts, and financial transactions across your logistics operations."
      icon={CreditCard}
      widgets={[
        { title: 'Escrow Management', description: 'Secure payment holding with automated release on delivery confirmation' },
        { title: 'Payout Dashboard', description: 'Track driver and vendor payouts with status monitoring' },
        { title: 'Transaction History', description: 'Complete financial audit trail with export capabilities' },
      ]}
    />
  );
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Comprehensive fleet performance analytics, operational efficiency metrics, and business intelligence dashboards."
      icon={BarChart3}
      widgets={[
        { title: 'Fleet Utilization', description: 'Vehicle uptime, idle time analysis, and capacity utilization rates' },
        { title: 'Driver Performance', description: 'Driver scoring, safety metrics, and efficiency benchmarks' },
        { title: 'Revenue Analytics', description: 'Revenue per route, cost analysis, and profitability tracking' },
      ]}
    />
  );
}

export function BrokerPage() {
  return (
    <PlaceholderPage
      title="Broker Operations"
      description="Broker command center for load validation, carrier assignment, and commission tracking."
      icon={Shield}
      widgets={[
        { title: 'Validation Queue', description: 'Review and validate incoming load requests from shippers' },
        { title: 'Carrier Assignment', description: 'Match loads with optimal carriers based on capacity and route' },
        { title: 'Commission Tracking', description: 'Monitor broker commissions, payouts, and performance metrics' },
      ]}
    />
  );
}
