import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companyApi } from '@/services/api/company';
import { vehicleApi } from '@/services/api/vehicle';
import { driverApi } from '@/services/api/driver';
import { ordersApi } from '@/services/api/ordersApi';
import { Activity, Home } from 'lucide-react';

function StatCard({ title, value, description }: { title: string; value: number | string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold text-foreground my-3">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DefaultDashboard() {
  const { user } = useAuth();

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['dashboard', 'companies'],
    queryFn: companyApi.getCompanies,
  });
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['dashboard', 'vehicles'],
    queryFn: vehicleApi.getCompanyVehicles,
  });
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['dashboard', 'assignments'],
    queryFn: driverApi.getAssignments,
  });
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: ordersApi.getMyOrders,
  });

  const orders = useMemo(() => ordersResponse?.data?.orders || [], [ordersResponse]);
  const companyCount = companies?.length ?? 0;
  const vehicleCount = vehicles?.length ?? 0;
  const assignmentCount = assignments?.length ?? 0;

  const isLoading = companiesLoading || vehiclesLoading || assignmentsLoading || ordersLoading;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-muted-foreground">Welcome to Fleet Command Center</p>
        </div>
      </motion.div>

      <motion.div
        transition={{ delay: 0.1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard title="Active Companies" value={companyCount} description="Transport companies onboarded" />
        <StatCard title="Fleet vehicles" value={vehicleCount} description="Registered vehicles" />
        <StatCard
          title="Orders & Assignments"
          value={orders.length}
          description="Orders you created"
        />
        <StatCard
          title="Driver Assignments"
          value={assignmentCount}
          description="Active driver trips"
        />
      </motion.div>

      <motion.div
        transition={{ delay: 0.2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]"
      >
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading companies...</p>
            ) : companyCount > 0 ? (
              <p className="text-sm text-foreground">{companyCount} active companies today.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No companies yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-secondary" />
            <CardTitle className="text-base font-semibold">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : orders.length ? (
              orders.slice(0, 3).map((order) => (
                <div key={order._id} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold text-foreground">{order.title || order._id}</p>
                  <p className="text-xs text-muted-foreground">Status: {order.status || 'UNKNOWN'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent orders.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base font-semibold">Driver Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading assignments...</p>
            ) : assignmentCount ? (
              <p className="text-sm text-foreground">{assignmentCount} driver assignments live.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No driver trips yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
