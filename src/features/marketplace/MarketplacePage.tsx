import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ordersApi } from '@/services/api/ordersApi';
import { brokerApi } from '@/services/api/brokerApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Package, Search, Heart, Send, Plus } from 'lucide-react';
import type { MarketplaceOrderCreatePayload, Order } from '@/types';

const statusColor: Record<string, string> = {
  OPEN: 'bg-primary/10 text-primary',
  MATCHED: 'bg-accent/50 text-accent-foreground',
  ASSIGNED: 'bg-muted text-foreground',
  IN_TRANSIT: 'bg-primary/20 text-primary',
  DELIVERED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive',
};

export default function MarketplacePage() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  // Determine view mode based on role
  const isDriverView = ['DRIVER', 'OPERATOR', 'BROKER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PRIVATE_TRANSPORTER'].includes(userRole ?? '');
  const isShipperView = userRole === 'SHIPPER' || userRole === 'VENDOR';
  const [mode, setMode] = useState<'browse' | 'post'>(isShipperView ? 'post' : 'browse');

  const [filters, setFilters] = useState({ search: '', sort: 'newest' });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'>('DIRECT_COMPANY');
  const [targetId, setTargetId] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      pickupAddress: '',
      pickupCity: '',
      deliveryAddress: '',
      deliveryCity: '',
      pickupDate: '',
      budget: 0,
      notes: '',
    },
  });

  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });
  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });

  const orders: Order[] = marketplaceData?.data?.orders || [];
  const myOrders: Order[] = mineData?.data?.orders || [];

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (order) =>
          order.title?.toLowerCase().includes(q) ||
          order.pickupLocation?.city?.toLowerCase().includes(q) ||
          order.deliveryLocation?.city?.toLowerCase().includes(q)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketplaceData, filters]);

  const assignMutation = useMutation({
    mutationFn: (payload: Parameters<typeof brokerApi.assignOrder>[0]) => brokerApi.assignOrder(payload),
    onSuccess: () => {
      toast({ title: 'Assignment request sent' });
      setSelectedOrders(new Set());
      setTargetId('');
    },
    onError: () => toast({ title: 'Assignment failed', variant: 'destructive' }),
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: MarketplaceOrderCreatePayload) => ordersApi.createMarketplaceOrder(payload),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      toast({ title: 'Order posted to marketplace!' });
    },
    onError: () => toast({ title: 'Failed to create order', variant: 'destructive' }),
  });

  const toggleSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
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
    });
  };

  const handleCreateOrder = (values: any) => {
    const payload: MarketplaceOrderCreatePayload = {
      assignmentMode: 'OPEN_MARKETPLACE',
      title: values.title,
      description: values.notes,
      pickupLocation: { address: values.pickupAddress, city: values.pickupCity, country: 'Ethiopia' },
      deliveryLocation: { address: values.deliveryAddress, city: values.deliveryCity, country: 'Ethiopia' },
      pickupDate: values.pickupDate,
      proposedBudget: Number(values.budget),
      currency: 'ETB',
      paymentMethod: 'WALLET',
    };
    createOrderMutation.mutate(payload);
  };

  const pendingOrders = orders.filter((o) => o.status === 'MATCHED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" /> Marketplace
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isShipperView ? 'Post loads and browse marketplace' : 'Browse available loads and send requests'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant={mode === 'browse' ? 'default' : 'outline'} size="sm" onClick={() => setMode('browse')}>
              <Search className="h-4 w-4 mr-1" /> Browse
            </Button>
            {isShipperView && (
              <Button variant={mode === 'post' ? 'default' : 'outline'} size="sm" onClick={() => setMode('post')}>
                <Plus className="h-4 w-4 mr-1" /> Post Load
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by title, city..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <Select value={filters.sort} onValueChange={(v) => setFilters((prev) => ({ ...prev, sort: v }))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_desc">Budget High→Low</SelectItem>
            <SelectItem value="price_asc">Budget Low→High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === 'browse' ? (
        <div className="space-y-6">
          {/* Pending Approvals (Driver view) */}
          {isDriverView && pendingOrders.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">Budget: {order.pricing?.proposedBudget ?? '—'} ETB</p>
                    </div>
                    <Badge variant="secondary">Awaiting admin</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Marketplace Grid */}
          {loadingMarketplace ? (
            <p className="text-sm text-muted-foreground">Loading marketplace…</p>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No orders match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className={`rounded-xl border bg-card p-4 cursor-pointer transition-all shadow-card hover:shadow-md ${
                    selectedOrders.has(order._id) ? 'border-primary ring-1 ring-primary/20' : 'border-border'
                  }`}
                  onClick={() => isDriverView && toggleSelection(order._id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{order.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">{order.assignmentMode || 'Open marketplace'}</p>
                    </div>
                    <Badge className={statusColor[order.status || 'OPEN'] || 'bg-muted text-muted-foreground'}>
                      {order.status || 'OPEN'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>📍 {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}</p>
                    <p>💰 {order.pricing?.currency ?? 'ETB'} {order.pricing?.proposedBudget ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDriverView && (
                      <Button size="sm" variant={selectedOrders.has(order._id) ? 'default' : 'outline'} className="text-xs" onClick={(e) => { e.stopPropagation(); toggleSelection(order._id); }}>
                        {selectedOrders.has(order._id) ? '✓ Selected' : 'Select'}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs ml-auto" onClick={(e) => {
                      e.stopPropagation();
                      setWishlist((prev) => prev.includes(order._id) ? prev : [...prev, order._id]);
                      toast({ title: 'Saved to wishlist' });
                    }}>
                      <Heart className={`h-3 w-3 mr-1 ${wishlist.includes(order._id) ? 'fill-primary text-primary' : ''}`} />
                      {wishlist.includes(order._id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Reserve/Assign Panel (Driver/Operator view) */}
          {isDriverView && selectedOrders.size > 0 && (
            <Card>
              <CardHeader><CardTitle>Reserve Selected Loads ({selectedOrders.size})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <Select value={assignmentMode} onValueChange={(v) => setAssignmentMode(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIRECT_COMPANY">Direct to company</SelectItem>
                      <SelectItem value="DIRECT_PRIVATE_TRANSPORTER">Direct transporter</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target ID" />
                  <Button disabled={!targetId.trim() || assignMutation.isPending} onClick={handleAssignBatch}>
                    <Send className="h-4 w-4 mr-1" />
                    {assignMutation.isPending ? 'Sending…' : `Send Request (${selectedOrders.size})`}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected loads will be routed through broker validation and contract approval.
                </p>
              </CardContent>
            </Card>
          )}

          {/* My Orders (Shipper reference) */}
          {isShipperView && (
            <Card>
              <CardHeader><CardTitle>Your Posted Orders</CardTitle></CardHeader>
              <CardContent>
                {loadingMine ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : myOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You haven't posted any shipments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myOrders.map((order) => (
                      <div key={order._id} className="rounded-lg border border-border p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.title || order._id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}
                          </p>
                        </div>
                        <Badge className={statusColor[order.status || 'OPEN']}>{order.status || 'OPEN'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Post Load Form (Shipper) */
        <Card>
          <CardHeader><CardTitle>Post a New Shipment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreateOrder)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Shipment Title</label>
                <Input {...register('title', { required: true, minLength: 3 })} placeholder="e.g. Addis to Awash Delivery" />
                {errors.title && <p className="text-xs text-destructive mt-1">Title is required (min 3 chars)</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pickup City</label>
                  <Input {...register('pickupCity', { required: true })} placeholder="Addis Ababa" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Delivery City</label>
                  <Input {...register('deliveryCity', { required: true })} placeholder="Adama" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pickup Address</label>
                  <Input {...register('pickupAddress', { required: true })} placeholder="Bole Road Warehouse" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Delivery Address</label>
                  <Input {...register('deliveryAddress', { required: true })} placeholder="Adama Hub" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pickup Date</label>
                  <Input type="datetime-local" {...register('pickupDate', { required: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Proposed Budget (ETB)</label>
                  <Input type="number" {...register('budget', { required: true, valueAsNumber: true, min: 100 })} placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Special Instructions</label>
                <Textarea {...register('notes')} placeholder="Fragile cargo, specific timing..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createOrderMutation.isPending || isSubmitting}>
                {createOrderMutation.isPending ? 'Posting…' : 'Post Shipment to Marketplace'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
