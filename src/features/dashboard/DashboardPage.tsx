import { motion } from 'framer-motion';
import {
  Truck, Users, Building2, AlertTriangle, Plus, MapPin, FileText,
  CreditCard, Activity, ArrowRight, Clock,
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

const comingSoonModules = [
  { title: 'Live Tracking', desc: 'Real-time fleet GPS monitoring', icon: MapPin, color: 'text-info' },
  { title: 'Contracts', desc: 'Vendor agreements & approvals', icon: FileText, color: 'text-warning' },
  { title: 'Payments', desc: 'Escrow & payout management', icon: CreditCard, color: 'text-success' },
  { title: 'Analytics', desc: 'Fleet performance insights', icon: Activity, color: 'text-primary' },
];

export default function DashboardPage() {
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
  const activeCompanies = companies.filter((c) => c.active).length;

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
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Commander'} 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your fleet overview • <span className="capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Total Vehicles" value={vehicles.length} icon={Truck} subtitle={`${activeVehicles} active`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Total Companies" value={companies.length} icon={Building2} subtitle={`${activeCompanies} active`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Fleet Status" value={activeVehicles} icon={Activity} subtitle="Operational units" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Pending Actions" value={0} icon={AlertTriangle} subtitle="All clear" />
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
              { label: 'Add Company', to: '/company', icon: Building2 },
              { label: 'Add Vehicle', to: '/vehicles', icon: Truck },
              { label: 'Add Driver', to: '/drivers', icon: Users },
              { label: 'Settings', to: '/settings', icon: AlertTriangle },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                asChild
                className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link to={action.to}>
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Fleet Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Fleet Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Active', count: vehicles.filter((v) => v.status === 'ACTIVE').length, total: vehicles.length, status: 'ACTIVE' as const },
              { label: 'Inactive', count: vehicles.filter((v) => v.status === 'INACTIVE').length, total: vehicles.length, status: 'INACTIVE' as const },
              { label: 'Maintenance', count: vehicles.filter((v) => v.status === 'MAINTENANCE').length, total: vehicles.length, status: 'MAINTENANCE' as const },
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { text: 'System initialized', time: 'Just now', icon: Activity },
              { text: 'Fleet data loaded', time: 'Moments ago', icon: Truck },
              { text: 'Dashboard ready', time: 'Now', icon: Clock },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Modules */}
      <div>
        <h3 className="text-lg font-semibold font-display mb-4">Upcoming Modules</h3>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {comingSoonModules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 p-6 shadow-card group"
            >
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4`}>
                <mod.icon className={`h-6 w-6 ${mod.color}`} />
              </div>
              <h4 className="font-semibold font-display text-foreground mb-1">{mod.title}</h4>
              <p className="text-xs text-muted-foreground">{mod.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
