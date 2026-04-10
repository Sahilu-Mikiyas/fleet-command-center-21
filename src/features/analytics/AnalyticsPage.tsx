import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChartBar, Gauge, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ordersApi } from '@/services/api/ordersApi';
import type { Order } from '@/types';

const statusLabels = {
  OPEN: 'Open',
  MATCHED: 'Matched',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

type StatusKey = keyof typeof statusLabels;

export default function AnalyticsPage() {
  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['analytics', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });
  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['analytics', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });

  const marketplaceOrders: Order[] = marketplaceData?.data?.orders || [];
  const myOrders: Order[] = mineData?.data?.orders || [];

  const statusBreakdown = useMemo(() => {
    const buckets = { OPEN: 0, MATCHED: 0, ASSIGNED: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 };
    marketplaceOrders.forEach((order) => {
      const key = (order.status || 'OPEN') as StatusKey;
      buckets[key] = (buckets[key] ?? 0) + 1;
    });
    return buckets;
  }, [marketplaceOrders]);

  const totalOrders = marketplaceOrders.length;
  const delivered = statusBreakdown.DELIVERED;
  const completionRate = totalOrders ? Math.round((delivered / totalOrders) * 100) : 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8"
      >
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="text-xl">Analytics</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Live KPIs for your fleet: order volume, delivery coverage, and marketplace health.
          </p>
        </CardContent>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base">Completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMarketplace ? (
              <p className="text-sm text-muted-foreground">Calculating…</p>
            ) : (
              <p className="text-3xl font-semibold text-foreground">{completionRate}%</p>
            )}
            <p className="text-xs text-muted-foreground">Delivered vs total marketplace orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-secondary" />
            <CardTitle className="text-base">Total marketplace orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">Active opportunities for transport</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Your orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{myOrders.length}</p>
            <p className="text-xs text-muted-foreground">Orders you’ve created</p>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Status breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(statusBreakdown).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-border p-4">
                <p className="text-xs uppercase text-muted-foreground">{statusLabels[key as StatusKey]}</p>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <div className="h-1 rounded-full bg-muted">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${totalOrders ? (value / totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
