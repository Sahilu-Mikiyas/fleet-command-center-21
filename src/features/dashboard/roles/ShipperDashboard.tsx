import { motion } from 'framer-motion';
import {
  Package, MapPin, DollarSign, Clock, Plus, TrendingUp, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ShipperDashboard() {
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const mockOrders = [
    { id: 1, status: 'ACTIVE', destination: 'New York', weight: 500, cost: 1200 },
    { id: 2, status: 'PENDING', destination: 'Los Angeles', weight: 750, cost: 1800 },
    { id: 3, status: 'COMPLETED', destination: 'Chicago', weight: 600, cost: 1500 },
  ];

  const activeOrders = mockOrders.filter(o => o.status === 'ACTIVE').length;
  const completedOrders = mockOrders.filter(o => o.status === 'COMPLETED').length;
  const totalSpent = mockOrders.reduce((sum, o) => sum + o.cost, 0);

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
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Shipper'} 👋
          </h1>
          <p className="text-muted-foreground">
            Welcome to your shipping dashboard • Manage your shipments and track deliveries
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Active Shipments" value={activeOrders} icon={Package} subtitle="In transit" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Completed Orders" value={completedOrders} icon={CheckCircle2} subtitle="This month" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Total Spent" value={`$${totalSpent}`} icon={DollarSign} subtitle="This month" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Pending Approvals" value={0} icon={AlertCircle} subtitle="All clear" />
        </motion.div>
      </motion.div>

      {/* Quick Actions & Recent Orders */}
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
              { label: 'New Shipment', to: '/orders', icon: Plus },
              { label: 'Track Order', to: '/tracking', icon: MapPin },
              { label: 'Payments', to: '/payments', icon: DollarSign },
              { label: 'Contracts', to: '/contracts', icon: Package },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                asChild
                className="h-auto flex-col gap-2 py-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              >
                <Link to={action.to}>
                  <action.icon className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {mockOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.destination} • {order.weight}kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">${order.cost}</span>
                  <StatusBadge status={order.status as any} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Performance Overview</h3>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">On-time Delivery Rate</p>
            <p className="text-2xl font-bold text-foreground">98%</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg. Delivery Time</p>
            <p className="text-2xl font-bold text-foreground">2.3 days</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Cost Savings</p>
            <p className="text-2xl font-bold text-green-500">+12%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
