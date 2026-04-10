import { motion } from 'framer-motion';
import {
  Package, MapPin, DollarSign, TrendingUp, Plus, Bell, ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/services/api/ordersApi';
import type { Order } from '@/types';

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

  const { data: myOrdersRes, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });

  const { data: marketplaceRes, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['orders', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const myOrders: Order[] = myOrdersRes?.data?.orders || [];
  const marketplaceOrders: Order[] = marketplaceRes?.data?.orders || [];

  const totalOrders = myOrders.length;
  const activeOrders = myOrders.filter(o => o.status === 'OPEN' || o.status === 'MATCHED' || o.status === 'ASSIGNED' || o.status === 'IN_TRANSIT').length;
  const deliveredOrders = myOrders.filter(o => o.status === 'DELIVERED').length;
  const completionRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const openMarketplace = marketplaceOrders.filter(o => o.status === 'OPEN').length;

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
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Shipper'} 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your orders, monitor proposals, and track deliveries
          </p>
        </div>
      </motion.div>

      {/* Hero Summary KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <StatCard title="Total Orders" value={totalOrders} icon={Package} subtitle="From /orders/mine" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Active Orders" value={activeOrders} icon={TrendingUp} subtitle="Open / Matched / Assigned" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} subtitle={`${deliveredOrders} delivered`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Marketplace Open" value={openMarketplace} icon={ShoppingCart} subtitle="Open orders on marketplace" />
        </motion.div>
      </motion.div>

      {/* Order List + Quick Actions */}
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
              { label: 'New Order', to: '/orders', icon: Plus },
              { label: 'Track', to: '/tracking', icon: MapPin },
              { label: 'Payments', to: '/payments', icon: DollarSign },
              { label: 'Contracts', to: '/contracts', icon: Package },
            ].map((action) => (
              <Button key={action.label} variant="outline" asChild className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Link to={action.to}>
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>

          {/* Payments Widget */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Wallet Top-up</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Use Chapa to add funds for orders</p>
            <Button size="sm" asChild className="w-full">
              <Link to="/payments">Top up via Chapa</Link>
            </Button>
          </div>
        </motion.div>

        {/* My Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">My Orders</h3>
            <Button size="sm" variant="outline" asChild>
              <Link to="/orders">View all</Link>
            </Button>
          </div>
          {loadingMine ? (
            <p className="text-sm text-muted-foreground">Loading your orders…</p>
          ) : myOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet. Create your first order!</p>
          ) : (
            <div className="space-y-3">
              {myOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.assignmentMode && (
                      <span className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded">{order.assignmentMode}</span>
                    )}
                    <StatusBadge status={(order.status || 'OPEN') as any} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Marketplace Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Marketplace Snapshot</h3>
          <Button size="sm" variant="outline" asChild>
            <Link to="/orders">Browse marketplace</Link>
          </Button>
        </div>
        {loadingMarketplace ? (
          <p className="text-sm text-muted-foreground">Loading marketplace…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Open Orders</p>
              <p className="text-2xl font-bold text-foreground">{openMarketplace}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Marketplace Orders</p>
              <p className="text-2xl font-bold text-foreground">{marketplaceOrders.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Avg Budget</p>
              <p className="text-2xl font-bold text-foreground">
                {marketplaceOrders.length > 0
                  ? `${Math.round(marketplaceOrders.reduce((sum, o) => sum + (o.pricing?.proposedBudget || 0), 0) / marketplaceOrders.length)} ETB`
                  : '—'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Notifications Timeline (placeholder) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Notifications</h3>
        </div>
        <p className="text-sm text-muted-foreground">No new notifications. Proposal and assignment alerts will appear here once the notifications endpoint is live.</p>
      </motion.div>
    </div>
  );
}
