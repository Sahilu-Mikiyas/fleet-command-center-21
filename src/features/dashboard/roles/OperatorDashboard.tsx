import { motion } from 'framer-motion';
import {
  Truck, Users, BarChart3, AlertTriangle, Plus, MapPin, DollarSign, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { companyApi } from '@/services/api/company';
import { vehicleApi } from '@/services/api/vehicle';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OperatorDashboard() {
  const { user } = useAuth();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getCompanies,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getCompanyVehicles,
  });

  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  // Mock data for revenue
  const monthlyRevenue = 45000;
  const pendingPayments = 8500;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-orange-500/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Operator'} 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your fleet operations • Track vehicles, drivers, and revenue
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Active Vehicles" value={activeVehicles} icon={Truck} subtitle={`${vehicles.length} total`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Monthly Revenue" value={`$${monthlyRevenue}`} icon={DollarSign} subtitle="This month" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Pending Payments" value={`$${pendingPayments}`} icon={BarChart3} subtitle="Awaiting settlement" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Maintenance" value={maintenanceVehicles} icon={AlertTriangle} subtitle="Vehicles in service" />
        </motion.div>
      </motion.div>

      {/* Quick Actions & Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Vehicle', to: '/vehicles', icon: Truck },
              { label: 'Add Driver', to: '/drivers', icon: Users },
              { label: 'Track Fleet', to: '/tracking', icon: MapPin },
              { label: 'View Payments', to: '/payments', icon: DollarSign },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                asChild
                className="h-auto flex-col gap-2 py-4 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
              >
                <Link to={action.to}>
                  <action.icon className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Fleet Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Fleet Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Active', count: activeVehicles, total: vehicles.length, status: 'ACTIVE' as const },
              { label: 'Inactive', count: vehicles.filter((v) => v.status === 'INACTIVE').length, total: vehicles.length, status: 'INACTIVE' as const },
              { label: 'Maintenance', count: maintenanceVehicles, total: vehicles.length, status: 'MAINTENANCE' as const },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.total ? `${(item.count / item.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Completed Trips</p>
              <p className="text-2xl font-bold text-green-500">$32,500</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-500">$8,500</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">Total This Month</p>
              <p className="text-2xl font-bold text-blue-500">$45,000</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Performance Metrics</h3>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg. Trip Duration</p>
            <p className="text-2xl font-bold text-foreground">4.2 hrs</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Fleet Utilization</p>
            <p className="text-2xl font-bold text-foreground">87%</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Fuel Efficiency</p>
            <p className="text-2xl font-bold text-foreground">8.5 km/L</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Safety Rating</p>
            <p className="text-2xl font-bold text-green-500">4.8/5</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
