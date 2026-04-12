import { Fragment, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ordersApi } from '@/services/api/ordersApi';
import { brokerApi } from '@/services/api/brokerApi';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceOrderCreatePayload, Order } from '@/types';

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

const orderFormSchema = z.object({
  title: z.string().min(3),
  pickupAddress: z.string().min(3),
  pickupCity: z.string().min(2),
  deliveryAddress: z.string().min(3),
  deliveryCity: z.string().min(2),
  pickupDate: z.string(),
  budget: z.number().positive(),
  vehicleType: z.string().optional(),
  notes: z.string().max(400).optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type ViewMode = 'driver' | 'customer';

const driverRoles: ViewMode[] = ['driver'];

export default function MarketplacePage() {
  const { userRole } = useAuth();
  const initialMode: ViewMode = driverRoles.includes('driver' as ViewMode) && ['DRIVER', 'OPERATOR', 'BROKER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'].includes(userRole ?? '')
    ? 'driver'
    : 'customer';
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [filters, setFilters] = useState({ search: '', city: 'all', sort: 'newest' });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'>('DIRECT_COMPANY');
  const [targetId, setTargetId] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderFormValues>({
    resolver: (values) => ({ values, errors: {} as any }),
  });

  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });
  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });

  const orders = marketplaceData?.data?.orders || [];
  const myOrders = mineData?.data?.orders || [];

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (order) =>
          order.title?.toLowerCase().includes(q) ||
          order.pickupLocation?.address?.toLowerCase().includes(q) ||
          order.deliveryLocation?.address?.toLowerCase().includes(q)
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

  const assignMutation = useMutation({
    mutationFn: (payload: Parameters<typeof brokerApi.assignOrder>[0]) => brokerApi.assignOrder(payload),
  });

  const validateMutation = useMutation({
    mutationFn: (orderId: string) => brokerApi.validateOrder(orderId),
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ orderId, vehicleId }: { orderId: string; vehicleId: string }) =>
      brokerApi.assignVehicle(orderId, vehicleId)
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: MarketplaceOrderCreatePayload) => ordersApi.createMarketplaceOrder(payload),
    onSuccess: () => reset(),
  });

  const toggleSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleAssignBatch = () => {
    if (!targetId.trim() || !selectedOrders.size) return;
    selectedOrders.forEach((orderId) => {
      assignMutation.mutate({
        orderId,
        assignmentMode,
        targetCompanyId: assignmentMode === 'DIRECT_COMPANY' ? targetId.trim() : undefined,
        targetTransporterId: assignmentMode === 'DIRECT_PRIVATE_TRANSPORTER' ? targetId.trim() : undefined,
      });
      validateMutation.mutate(orderId);
    });
  };

  const handleAddToWishlist = (orderId: string) => {
    setWishlist((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
  };

  const handleCreateOrder = (values: OrderFormValues) => {
    const payload: MarketplaceOrderCreatePayload = {
      assignmentMode: 'OPEN_MARKETPLACE',
      title: values.title,
      description: values.notes,
      pickupLocation: {
        address: values.pickupAddress,
        city: values.pickupCity,
        country: 'Ethiopia',
      },
      deliveryLocation: {
        address: values.deliveryAddress,
        city: values.deliveryCity,
        country: 'Ethiopia',
      },
      pickupDate: values.pickupDate,
      proposedBudget: values.budget,
      currency: 'ETB',
      paymentMethod: 'WALLET',
    };
    createOrderMutation.mutate(payload);
  };

  const driverPending = orders.filter((order) => order.status === 'MATCHED');

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Dual marketplace</p>
            <h1 className="text-3xl font-bold text-foreground">Fleets & shipments</h1>
            <p className="text-xs text-muted-foreground mt-1">Driver/operator view + customer upload + reference gallery.</p>
          </div>
          <div className="flex gap-3">
            <Button variant={mode === 'driver' ? 'default' : 'outline'} size="sm" onClick={() => setMode('driver')}>
              Driver view
            </Button>
            <Button variant={mode === 'customer' ? 'default' : 'outline'} size="sm" onClick={() => setMode('customer')}>
              Customer view
            </Button>
          </div>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by route or cargo"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="min-w-[220px]"
            />
            <Select value={filters.city} onValueChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}>
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

      {mode === 'driver' ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending approvals</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {driverPending.length ? (
                driverPending.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">Budget: {order.pricing?.proposedBudget ?? '--'}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Awaiting admin</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pending approvals yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {loadingMarketplace ? (
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
                      <Button size="sm" variant="ghost" onClick={() => toggleSelection(order._id)}>
                        {selectedOrders.has(order._id) ? 'Selected' : 'Select load'}
                      </Button>
                      <Button size="sm" onClick={() => handleAddToWishlist(order._id)}>
                        Save reference
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No orders matching your filters.</p>
            )}
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Reserve selected loads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Select value={assignmentMode} onValueChange={(value) => setAssignmentMode(value as any)}>
                  <option value="DIRECT_COMPANY">Direct to company</option>
                  <option value="DIRECT_PRIVATE_TRANSPORTER">Direct transporter</option>
                </Select>
                <Input value={targetId} onChange={(event) => setTargetId(event.target.value)} placeholder="Target ID" />
                <Button
                  variant="outline"
                  disabled={!selectedOrders.size || !targetId.trim()}
                  onClick={handleAssignBatch}
                >
                  Send request ({selectedOrders.size})
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Selected loads will be routed through broker validation and contract approval. Admin will review the request.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex flex-wrap gap-4">
              <Input {...register('title')} placeholder="Shipment title" className="flex-1" />
              <Input {...register('pickupCity')} placeholder="Pickup city" />
              <Input {...register('deliveryCity')} placeholder="Delivery city" />
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <Input {...register('pickupAddress')} placeholder="Pickup address" />
              <Input {...register('deliveryAddress')} placeholder="Delivery address" />
              <Input type="datetime-local" {...register('pickupDate')} placeholder="Pickup date" />
              <Input type="number" {...register('budget', { valueAsNumber: true })} placeholder="Proposed budget" />
            </div>
            <Textarea {...register('notes')} placeholder="Special instructions" className="mt-3" />
            <Button className="mt-4" onClick={handleSubmit(handleCreateOrder)} disabled={createOrderMutation.isLoading || isSubmitting}>
              {createOrderMutation.isLoading ? 'Posting…' : 'Post shipment'}
            </Button>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle>Your saved posts</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMine ? (
                <p className="text-sm text-muted-foreground">Loading your posts…</p>
              ) : myOrders.length ? (
                <div className="space-y-3">
                  {myOrders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-border/70 p-3">
                      <p className="font-semibold">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">Status: {order.status || 'OPEN'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You haven’t posted any shipments yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reference board</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMarketplace ? (
                <p className="text-sm text-muted-foreground">Loading marketplace…</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order._id} className="rounded-2xl border border-border px-4 py-3">
                      <p className="font-semibold">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">Budget: {order.pricing?.proposedBudget ?? '--'}</p>
                      <Button size="sm" variant="tertiary" onClick={() => handleAddToWishlist(order._id)}>
                        {wishlist.includes(order._id) ? 'Saved' : 'Save reference'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
