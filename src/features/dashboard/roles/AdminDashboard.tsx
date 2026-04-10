import { motion } from 'framer-motion';
import {
  AlertTriangle, BarChart3, Shield, Activity, Building2, FileText, ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { companyApi } from '@/services/api/company';
import { contractApi } from '@/services/api/contractApi';
import { ordersApi } from '@/services/api/ordersApi';
import { vehicleApi } from '@/services/api/vehicle';
import { toast } from '@/hooks/use-toast';
import type { Contract, Order, Company } from '@/types';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getCompanies,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getCompanyVehicles,
  });

  const { data: vendorContractsRes } = useQuery({
    queryKey: ['contracts', 'vendor'],
    queryFn: () => contractApi.getVendorContracts(),
  });

  const { data: companyContractsRes } = useQuery({
    queryKey: ['contracts', 'company'],
    queryFn: () => contractApi.getCompanyContracts(),
  });

  const { data: marketplaceRes } = useQuery({
    queryKey: ['orders', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const vendorContracts: Contract[] = vendorContractsRes?.data?.contracts || [];
  const companyContracts: Contract[] = companyContractsRes?.data?.contracts || [];
  const allContracts = [...vendorContracts, ...companyContracts];
  const marketplaceOrders: Order[] = marketplaceRes?.data?.orders || [];
  const pendingCompanies = companies.filter((c: Company) => c.status === 'PENDING');
  const pendingContracts = allContracts.filter(c => c.status === 'PENDING');

  const approveContractMutation = useMutation({
    mutationFn: (id: string) => contractApi.approveContract(id),
    onSuccess: () => {
      toast({ title: 'Contract approved' });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-destructive/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground">Full platform visibility — approvals, analytics, trust, and system health</p>
        </div>
      </motion.div>

      {/* Global Metrics */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Companies" value={companies.length} icon={Building2} subtitle="Registered" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Vehicles" value={vehicles.length} icon={BarChart3} subtitle="Fleet total" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Contracts" value={allContracts.length} icon={FileText} subtitle={`${pendingContracts.length} pending`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Marketplace" value={marketplaceOrders.length} icon={ShoppingCart} subtitle="Orders" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Pending Approvals" value={pendingCompanies.length + pendingContracts.length} icon={AlertTriangle} subtitle="Companies + contracts" />
        </motion.div>
      </motion.div>

      {/* Approvals Panel + System Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">Pending Company Approvals ({pendingCompanies.length})</h3>
          {pendingCompanies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending company approvals.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pendingCompanies.map((c: Company) => (
                <div key={c._id} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600">PENDING</span>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    Approve (PUT /company/{c._id}/approve)
                  </Button>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold font-display mt-6 mb-4">Pending Contract Approvals ({pendingContracts.length})</h3>
          {pendingContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending contracts.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pendingContracts.map(c => (
                <div key={c._id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{c._id}</p>
                  <Button size="sm" variant="outline" disabled={approveContractMutation.isPending} onClick={() => approveContractMutation.mutate(c._id)}>
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* System Analytics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">System Analytics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Active Companies</p>
              <p className="text-2xl font-bold text-foreground">{companies.filter((c: Company) => c.status === 'ACTIVE').length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Active Contracts</p>
              <p className="text-2xl font-bold text-foreground">{allContracts.filter(c => c.status === 'ACTIVE').length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Open Marketplace</p>
              <p className="text-2xl font-bold text-foreground">{marketplaceOrders.filter(o => o.status === 'OPEN').length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Delivered Orders</p>
              <p className="text-2xl font-bold text-foreground">{marketplaceOrders.filter(o => o.status === 'DELIVERED').length}</p>
            </div>
          </div>

          {/* Admin Quick Links */}
          <h3 className="text-lg font-semibold font-display mb-4">Admin Controls</h3>
          <div className="space-y-2">
            {[
              { label: 'Manage Companies', to: '/company', icon: Building2 },
              { label: 'View Contracts', to: '/contracts', icon: FileText },
              { label: 'Analytics', to: '/analytics', icon: BarChart3 },
              { label: 'Broker Operations', to: '/broker', icon: ShoppingCart },
              { label: 'Settings', to: '/settings', icon: Shield },
            ].map(item => (
              <Button key={item.label} className="w-full justify-start" variant="outline" asChild>
                <Link to={item.to}>
                  <item.icon className="h-4 w-4 mr-2" />{item.label}
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trust & Risk Alerts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold font-display">Trust & Risk Alerts</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Flagged users, high-risk transactions, and pending operator approvals will appear here once the trust/risk and admin alerts endpoints are live.
        </p>
      </motion.div>

      {/* Audit Trail placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Audit Trail</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Contract history, equb logs, and system audit events will display here when the audit endpoints are available.
        </p>
      </motion.div>
    </div>
  );
}
