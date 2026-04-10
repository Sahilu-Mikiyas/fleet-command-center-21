import { motion } from 'framer-motion';
import {
  Truck, Users, BarChart3, AlertTriangle, MapPin, DollarSign, TrendingUp, FileText, ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { companyApi } from '@/services/api/company';
import { vehicleApi } from '@/services/api/vehicle';
import { contractApi } from '@/services/api/contractApi';
import { ordersApi } from '@/services/api/ordersApi';
import { driverApi } from '@/services/api/driver';
import type { Contract, Order } from '@/types';

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

  const { data: contractsRes } = useQuery({
    queryKey: ['contracts', 'company'],
    queryFn: () => contractApi.getCompanyContracts(),
  });

  const { data: marketplaceRes } = useQuery({
    queryKey: ['orders', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['driver', 'assignments'],
    queryFn: () => driverApi.getAssignments(),
  });

  const contracts: Contract[] = contractsRes?.data?.contracts || [];
  const marketplaceOrders: Order[] = marketplaceRes?.data?.orders || [];
  const pendingContracts = contracts.filter(c => c.status === 'PENDING').length;
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const openMarketplace = marketplaceOrders.filter(o => o.status === 'OPEN').length;

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
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Operator'} 👋
          </h1>
          <p className="text-muted-foreground">
            Oversee companies, fleet, contracts, and marketplace assignments
          </p>
        </div>
      </motion.div>

      {/* Company Stats KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Companies" value={companies.length} icon={BarChart3} subtitle="Total registered" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Vehicles" value={vehicles.length} icon={Truck} subtitle={`${activeVehicles} active`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Pending Contracts" value={pendingContracts} icon={FileText} subtitle="Awaiting approval" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Marketplace Open" value={openMarketplace} icon={ShoppingCart} subtitle="Available orders" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Active Assignments" value={assignments.length} icon={MapPin} subtitle="Drivers on the road" />
        </motion.div>
      </motion.div>

      {/* Contracts Queue + Marketplace + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Vehicle', to: '/vehicles', icon: Truck },
              { label: 'Add Driver', to: '/drivers', icon: Users },
              { label: 'Track Fleet', to: '/tracking', icon: MapPin },
              { label: 'Payments', to: '/payments', icon: DollarSign },
              { label: 'Contracts', to: '/contracts', icon: FileText },
              { label: 'Broker', to: '/broker', icon: ShoppingCart },
            ].map(action => (
              <Button key={action.label} variant="outline" asChild className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Link to={action.to}>
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Contracts Queue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">Contracts Queue</h3>
            <Button size="sm" variant="outline" asChild><Link to="/contracts">View all</Link></Button>
          </div>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contracts found.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {contracts.slice(0, 5).map(c => (
                <div key={c._id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{c._id}</p>
                    <p className="text-xs text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <StatusBadge status={c.status as any} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Marketplace Snapshot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">Marketplace</h3>
            <Button size="sm" variant="outline" asChild><Link to="/broker">Assign</Link></Button>
          </div>
          {marketplaceOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No marketplace orders.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {marketplaceOrders.slice(0, 5).map(o => (
                <div key={o._id} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium text-foreground">{o.title || o._id}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.pickupLocation?.city ?? '—'} → {o.deliveryLocation?.city ?? '—'} • {o.status || 'OPEN'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Fleet Status + Payments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">Fleet Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Active', count: activeVehicles, total: vehicles.length, status: 'ACTIVE' as const },
              { label: 'Inactive', count: vehicles.filter(v => v.status === 'INACTIVE').length, total: vehicles.length, status: 'INACTIVE' as const },
              { label: 'Maintenance', count: vehicles.filter(v => v.status === 'MAINTENANCE').length, total: vehicles.length, status: 'MAINTENANCE' as const },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><StatusBadge status={item.status} /></span>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">Payments Overview</h3>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">Manage Chapa top-ups and escrow releases.</p>
          <Button asChild className="w-full">
            <Link to="/payments">Go to Payments</Link>
          </Button>
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Trust alerts and pending contractor approvals will appear here once the trust/risk endpoints are live.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
