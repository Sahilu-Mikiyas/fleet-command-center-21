import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, BarChart3, Shield, Activity, Building2, FileText, ShoppingCart,
  Settings, DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { companyApi } from '@/services/api/company';
import { contractApi } from '@/services/api/contractApi';
import { ordersApi } from '@/services/api/ordersApi';
import { vehicleApi } from '@/services/api/vehicle';
import { configApi } from '@/services/api/configApi';
import { toast } from 'sonner';
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
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [pricingValues, setPricingValues] = useState<Record<string, any>>({});

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: companyApi.getCompanies });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: vehicleApi.getCompanyVehicles });
  const { data: vendorContractsRes } = useQuery({ queryKey: ['contracts', 'vendor'], queryFn: () => contractApi.getVendorContracts() });
  const { data: companyContractsRes } = useQuery({ queryKey: ['contracts', 'company'], queryFn: () => contractApi.getCompanyContracts() });
  const { data: marketplaceRes } = useQuery({ queryKey: ['orders', 'marketplace'], queryFn: () => ordersApi.getMarketplaceOrders() });
  const { data: pricingData } = useQuery({ queryKey: ['pricing-config'], queryFn: () => configApi.getPricingConfig() });
  const { data: commissionData } = useQuery({ queryKey: ['commission-config'], queryFn: () => configApi.getCommissionConfig() });

  const vendorContracts: Contract[] = vendorContractsRes?.data?.contracts || [];
  const companyContracts: Contract[] = companyContractsRes?.data?.contracts || [];
  const allContracts = [...vendorContracts, ...companyContracts];
  const marketplaceOrders: Order[] = marketplaceRes?.data?.orders || [];
  const pendingCompanies = companies.filter((c: Company) => c.status === 'PENDING');
  const pendingContracts = allContracts.filter(c => c.status === 'PENDING');

  const approveContractMutation = useMutation({
    mutationFn: (id: string) => contractApi.approveContract(id),
    onSuccess: () => { toast.success('Contract approved'); queryClient.invalidateQueries({ queryKey: ['contracts'] }); },
    onError: (err: any) => toast.error(err.message || 'Approval failed'),
  });

  const approveCompanyMutation = useMutation({
    mutationFn: (id: string) => companyApi.approveCompany(id),
    onSuccess: () => { toast.success('Company approved'); queryClient.invalidateQueries({ queryKey: ['companies'] }); },
    onError: (err: any) => toast.error(err.message || 'Company approval failed'),
  });

  const approveUserMutation = useMutation({
    mutationFn: (userId: string) => companyApi.approveUser(userId),
    onSuccess: () => { toast.success('User approved'); },
    onError: (err: any) => toast.error(err.message || 'User approval failed'),
  });

  const updatePricingMutation = useMutation({
    mutationFn: (payload: any) => configApi.updatePricingConfig(payload),
    onSuccess: () => {
      toast.success('Pricing config updated');
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] });
      setShowPricingConfig(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update pricing'),
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
        <motion.div variants={fadeUp}><StatCard title="Companies" value={companies.length} icon={Building2} subtitle="Registered" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Vehicles" value={vehicles.length} icon={BarChart3} subtitle="Fleet total" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Contracts" value={allContracts.length} icon={FileText} subtitle={`${pendingContracts.length} pending`} /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Marketplace" value={marketplaceOrders.length} icon={ShoppingCart} subtitle="Orders" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Pending Approvals" value={pendingCompanies.length + pendingContracts.length} icon={AlertTriangle} subtitle="Companies + contracts" /></motion.div>
      </motion.div>

      {/* Approvals + System Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <p className="text-xs text-muted-foreground">{c.email} • {c.phoneNumber}</p>
                    </div>
                    <Badge variant="secondary">PENDING</Badge>
                  </div>
                  <Button size="sm" className="w-full mt-2" disabled={approveCompanyMutation.isPending} onClick={() => approveCompanyMutation.mutate(c._id)}>
                    {approveCompanyMutation.isPending ? 'Approving…' : 'Approve Company'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold font-display mt-6 mb-4">Pending Contracts ({pendingContracts.length})</h3>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">System Analytics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Active Companies', value: companies.filter((c: Company) => c.status === 'ACTIVE').length },
              { label: 'Active Contracts', value: allContracts.filter(c => c.status === 'ACTIVE').length },
              { label: 'Open Marketplace', value: marketplaceOrders.filter(o => o.status === 'OPEN').length },
              { label: 'Delivered Orders', value: marketplaceOrders.filter(o => o.status === 'DELIVERED').length },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Config Cards */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pricing Config</p>
                <p className="text-xs text-muted-foreground">{pricingData ? 'Loaded' : 'Loading…'}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                setPricingValues(pricingData?.data || {});
                setShowPricingConfig(true);
              }}>
                <Settings className="h-3 w-3 mr-1" /> Manage
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Commission Config</p>
                <p className="text-xs text-muted-foreground">
                  {commissionData?.data ? `Rate: ${JSON.stringify(commissionData.data).slice(0, 50)}…` : 'Loading…'}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/settings"><Settings className="h-3 w-3 mr-1" /> Settings</Link>
              </Button>
            </div>
          </div>

          <h3 className="text-lg font-semibold font-display mt-6 mb-4">Admin Controls</h3>
          <div className="space-y-2">
            {[
              { label: 'Manage Companies', to: '/company', icon: Building2 },
              { label: 'View Contracts', to: '/contracts', icon: FileText },
              { label: 'Analytics', to: '/analytics', icon: BarChart3 },
              { label: 'Broker Operations', to: '/broker', icon: ShoppingCart },
              { label: 'Payments', to: '/payments', icon: DollarSign },
            ].map(item => (
              <Button key={item.label} className="w-full justify-start" variant="outline" asChild>
                <Link to={item.to}><item.icon className="h-4 w-4 mr-2" />{item.label}</Link>
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
          Flagged users, high-risk transactions, and pending operator approvals will appear here once the trust/risk endpoints are live.
        </p>
      </motion.div>

      {/* Audit Trail placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Audit Trail</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Contract history, system logs, and audit events will display here when available.
        </p>
      </motion.div>

      {/* Pricing Config Dialog */}
      <Dialog open={showPricingConfig} onOpenChange={setShowPricingConfig}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Pricing Configuration</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {pricingData?.data && typeof pricingData.data === 'object' ? (
              Object.entries(pricingData.data).map(([key, value]) => (
                <div key={key}>
                  <Label>{key}</Label>
                  <Input
                    defaultValue={String(value ?? '')}
                    onChange={(e) => setPricingValues(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No pricing configuration data.</p>
            )}
            <Button className="w-full" disabled={updatePricingMutation.isPending} onClick={() => updatePricingMutation.mutate(pricingValues)}>
              {updatePricingMutation.isPending ? 'Saving…' : 'Save Pricing Config'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
