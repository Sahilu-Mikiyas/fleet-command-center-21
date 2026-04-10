import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/services/api/ordersApi';
import type { MarketplaceOrderCreatePayload, Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700',
  MATCHED: 'bg-sky-50 text-sky-700',
  ASSIGNED: 'bg-amber-50 text-amber-700',
  IN_TRANSIT: 'bg-violet-50 text-violet-700',
  DELIVERED: 'bg-slate-50 text-slate-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
};

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Budget (High→Low)', value: 'price_desc' },
  { label: 'Budget (Low→High)', value: 'price_asc' },
];

type Filters = {
  search: string;
  city: string;
  sort: string;
};

const defaultFilters: Filters = {
  search: '',
  city: 'all',
  sort: 'newest',
};

export default function MarketplacePage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const orders: Order[] = data?.data?.orders || [];

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (order) =>
          order.title?.toLowerCase().includes(query) ||
          order.pickupLocation?.address?.toLowerCase().includes(query) ||
          order.deliveryLocation?.address?.toLowerCase().includes(query)
      );
    }
    if (filters.city !== 'all') {
      result = result.filter(
        (order) =>
          order.pickupLocation?.city?.toLowerCase() === filters.city ||
          order.deliveryLocation?.city?.toLowerCase() === filters.city
      );
    }
    if (filters.sort === 'price_desc') {
      result.sort((a, b) => (b.pricing?.proposedBudget || 0) - (a.pricing?.proposedBudget || 0));
    } else if (filters.sort === 'price_asc') {
      result.sort((a, b) => (a.pricing?.proposedBudget || 0) - (b.pricing?.proposedBudget || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    return result;
  }, [orders, filters]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.pickupLocation?.city) set.add(order.pickupLocation.city.toLowerCase());
      if (order.deliveryLocation?.city) set.add(order.deliveryLocation.city.toLowerCase());
    });
    return Array.from(set);
  }, [orders]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8 text-foreground"
      >
        <p className="text-sm text-muted-foreground mb-2">Marketplace</p>
        <h1 className="text-3xl font-bold tracking-tight">Discover freight opportunities</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Browse shipments with transparent budgets, delivery windows, and pickup/dropoff cities. Select a route, see current offers,
          then bid or request direct assignment.
        </p>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by pickup or delivery"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="min-w-[220px]"
            />
            <Select
              value={filters.city}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
            >
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city[0].toUpperCase() + city.slice(1)}
                </option>
              ))}
            </Select>
            <Select value={filters.sort} onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value }))}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading marketplace …</p>
        ) : filteredOrders.length ? (
          filteredOrders.map((order) => (
            <Card key={order._id} className="hover:shadow-2xl transition-shadow">
              <CardHeader className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{order.title || 'Untitled shipment'}</p>
                  <p className="text-xs text-muted-foreground">{order.assignmentMode || 'Open marketplace'}</p>
                </div>
                <Badge className={statusColor[order.status || 'OPEN'] || 'bg-slate-50 text-slate-700'}>
                  {order.status || 'OPEN'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>
                    Pickup: {order.pickupLocation?.address ?? 'Unknown'} — {order.pickupLocation?.city ?? '—'}
                  </span>
                  <span>
                    Delivery: {order.deliveryLocation?.address ?? 'Unknown'} — {order.deliveryLocation?.city ?? '—'}
                  </span>
                  <span>Budget: {order.pricing?.currency ?? 'ETB'} {order.pricing?.proposedBudget ?? '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Posted</p>
                    <p className="text-sm text-foreground">{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '—'}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No orders matching your filters.</p>
        )}
      </div>
    </div>
  );
}
