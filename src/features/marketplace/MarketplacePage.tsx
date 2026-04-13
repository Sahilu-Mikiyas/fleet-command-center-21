import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ordersApi } from '@/services/api/ordersApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  ShoppingCart, Package, Search, Heart, Plus, Send, Eye,
  MapPin, DollarSign, Calendar, X, Check, XCircle, FileText,
} from 'lucide-react';
import type { MarketplaceOrderCreatePayload, Order } from '@/types';

const statusColor: Record<string, string> = {
  OPEN: 'bg-primary/10 text-primary',
  MATCHED: 'bg-accent/50 text-accent-foreground',
  ASSIGNED: 'bg-blue-500/10 text-blue-600',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-600',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-destructive/10 text-destructive',
};

// Persist wishlist in localStorage
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem('fleet_wishlist') || '[]'); } catch { return []; }
}
function setWishlistStorage(ids: string[]) {
  localStorage.setItem('fleet_wishlist', JSON.stringify(ids));
}

export default function MarketplacePage() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  const isShipperView = userRole === 'SHIPPER' || userRole === 'VENDOR';
  const isDriverView = ['DRIVER', 'PRIVATE_TRANSPORTER'].includes(userRole ?? '');
  const isBrokerView = ['BROKER', 'OPERATOR', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'].includes(userRole ?? '');

  const [mode, setMode] = useState<'browse' | 'post' | 'saved' | 'proposals'>(isShipperView ? 'post' : 'browse');
  const [filters, setFilters] = useState({ search: '', sort: 'newest', status: 'ALL' });
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalOrderId, setProposalOrderId] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', pickupAddress: '', pickupCity: '', deliveryAddress: '',
      deliveryCity: '', pickupDate: '', budget: 0, notes: '',
    },
  });

  const proposalForm = useForm({
    defaultValues: { proposedPrice: 0, estimatedDeliveryDate: '', notes: '' },
  });

  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });
  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
    enabled: isShipperView,
  });
  const { data: myProposalsData } = useQuery({
    queryKey: ['proposals', 'mine'],
    queryFn: () => ordersApi.getMyProposals(),
    enabled: isDriverView,
  });

  const orders: Order[] = marketplaceData?.data?.orders || [];
  const myOrders: Order[] = mineData?.data?.orders || [];
  const myProposals: any[] = myProposalsData?.data?.proposals || [];

  const filteredOrders = (() => {
    let result = [...orders];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o =>
        o.title?.toLowerCase().includes(q) ||
        o.pickupLocation?.city?.toLowerCase().includes(q) ||
        o.deliveryLocation?.city?.toLowerCase().includes(q)
      );
    }
    if (filters.status !== 'ALL') {
      result = result.filter(o => o.status === filters.status);
    }
    if (filters.sort === 'price_desc') result.sort((a, b) => (b.pricing?.proposedBudget || 0) - (a.pricing?.proposedBudget || 0));
    else if (filters.sort === 'price_asc') result.sort((a, b) => (a.pricing?.proposedBudget || 0) - (b.pricing?.proposedBudget || 0));
    else result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    return result;
  })();

  const savedOrders = orders.filter(o => wishlist.includes(o._id));

  const createOrderMutation = useMutation({
    mutationFn: (payload: MarketplaceOrderCreatePayload) => ordersApi.createMarketplaceOrder(payload),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      toast.success('Order posted to marketplace!');
      setMode('browse');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create order'),
  });

  const submitProposalMutation = useMutation({
    mutationFn: (data: { orderId: string; proposedPrice: number; estimatedDeliveryDate?: string; notes?: string }) =>
      ordersApi.submitProposal(data.orderId, {
        proposedPrice: data.proposedPrice,
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success('Proposal submitted! Awaiting shipper approval.');
      setShowProposalForm(false);
      proposalForm.reset();
      queryClient.invalidateQueries({ queryKey: ['proposals', 'mine'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit proposal'),
  });

  const toggleWishlist = (orderId: string) => {
    setWishlist(prev => {
      const next = prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId];
      setWishlistStorage(next);
      toast.success(next.includes(orderId) ? 'Saved to wishlist' : 'Removed from wishlist');
      return next;
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

  const handleSubmitProposal = (values: any) => {
    submitProposalMutation.mutate({
      orderId: proposalOrderId,
      proposedPrice: Number(values.proposedPrice),
      estimatedDeliveryDate: values.estimatedDeliveryDate || undefined,
      notes: values.notes || undefined,
    });
  };

  const renderOrderCard = (order: Order) => (
    <motion.div
      key={order._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer transition-all shadow-card hover:shadow-md"
      onClick={() => setSelectedOrder(order)}
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
      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}</p>
        <p className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {order.pricing?.currency ?? 'ETB'} {order.pricing?.proposedBudget?.toLocaleString() ?? '—'}</p>
        {order.createdAt && <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</p>}
      </div>
      <div className="flex items-center gap-2">
        {isDriverView && order.status === 'OPEN' && (
          <Button size="sm" variant="default" className="text-xs" onClick={(e) => {
            e.stopPropagation();
            setProposalOrderId(order._id);
            setShowProposalForm(true);
          }}>
            <Send className="h-3 w-3 mr-1" /> Send Proposal
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-xs ml-auto" onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(order._id);
        }}>
          <Heart className={`h-3 w-3 mr-1 ${wishlist.includes(order._id) ? 'fill-primary text-primary' : ''}`} />
          {wishlist.includes(order._id) ? 'Saved' : 'Save'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" /> Marketplace
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isShipperView ? 'Post loads and manage proposals' :
               isDriverView ? 'Browse loads and submit proposals' :
               'Monitor and manage marketplace orders'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={mode === 'browse' ? 'default' : 'outline'} size="sm" onClick={() => setMode('browse')}>
              <Search className="h-4 w-4 mr-1" /> Browse
            </Button>
            {(isDriverView) && (
              <>
                <Button variant={mode === 'saved' ? 'default' : 'outline'} size="sm" onClick={() => setMode('saved')}>
                  <Heart className="h-4 w-4 mr-1" /> Saved ({wishlist.length})
                </Button>
                <Button variant={mode === 'proposals' ? 'default' : 'outline'} size="sm" onClick={() => setMode('proposals')}>
                  <FileText className="h-4 w-4 mr-1" /> My Proposals
                </Button>
              </>
            )}
            {isShipperView && (
              <>
                <Button variant={mode === 'post' ? 'default' : 'outline'} size="sm" onClick={() => setMode('post')}>
                  <Plus className="h-4 w-4 mr-1" /> Post Load
                </Button>
                <Button variant={mode === 'proposals' ? 'default' : 'outline'} size="sm" onClick={() => setMode('proposals')}>
                  <Eye className="h-4 w-4 mr-1" /> Proposals
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters (browse/saved modes) */}
      {(mode === 'browse' || mode === 'saved') && (
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search by title, city..." value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="MATCHED">Matched</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sort} onValueChange={(v) => setFilters(prev => ({ ...prev, sort: v }))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_desc">Budget High→Low</SelectItem>
              <SelectItem value="price_asc">Budget Low→High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Browse Mode */}
      {mode === 'browse' && (
        <div className="space-y-6">
          {loadingMarketplace ? (
            <p className="text-sm text-muted-foreground">Loading marketplace…</p>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No orders match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map(renderOrderCard)}
            </div>
          )}
        </div>
      )}

      {/* Saved / Wishlist Mode */}
      {mode === 'saved' && (
        <div className="space-y-4">
          {savedOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No saved loads. Browse the marketplace and save loads you're interested in.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedOrders.map(renderOrderCard)}
            </div>
          )}
        </div>
      )}

      {/* My Proposals Mode (Driver) */}
      {mode === 'proposals' && isDriverView && (
        <Card>
          <CardHeader><CardTitle>My Submitted Proposals</CardTitle></CardHeader>
          <CardContent>
            {myProposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't submitted any proposals yet. Browse the marketplace and send proposals to available loads.</p>
            ) : (
              <div className="space-y-3">
                {myProposals.map((p: any, i: number) => (
                  <div key={p._id || i} className="rounded-lg border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Order: {p.orderId || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        Proposed: {p.proposedPrice?.toLocaleString()} ETB • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </p>
                      {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                    </div>
                    <Badge variant={p.status === 'ACCEPTED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                      {p.status || 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proposals Mode (Shipper) */}
      {mode === 'proposals' && isShipperView && (
        <ShipperProposalsView orders={myOrders} loading={loadingMine} />
      )}

      {/* Post Load Form (Shipper) */}
      {mode === 'post' && isShipperView && (
        <Card>
          <CardHeader><CardTitle>Post a New Shipment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreateOrder)} className="space-y-4">
              <div>
                <Label>Shipment Title *</Label>
                <Input {...register('title', { required: true, minLength: 3 })} placeholder="e.g. Addis to Awash Delivery" />
                {errors.title && <p className="text-xs text-destructive mt-1">Title is required (min 3 chars)</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pickup City *</Label><Input {...register('pickupCity', { required: true })} placeholder="Addis Ababa" /></div>
                <div><Label>Delivery City *</Label><Input {...register('deliveryCity', { required: true })} placeholder="Adama" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pickup Address *</Label><Input {...register('pickupAddress', { required: true })} placeholder="Bole Road Warehouse" /></div>
                <div><Label>Delivery Address *</Label><Input {...register('deliveryAddress', { required: true })} placeholder="Adama Hub" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pickup Date *</Label>
                  <Input type="datetime-local" {...register('pickupDate', { required: true })} min={new Date().toISOString().slice(0, 16)} />
                </div>
                <div>
                  <Label>Proposed Budget (ETB) *</Label>
                  <Input type="number" {...register('budget', { required: true, valueAsNumber: true, min: 100 })} placeholder="5000" />
                  {errors.budget && <p className="text-xs text-destructive mt-1">Min budget: 100 ETB</p>}
                </div>
              </div>
              <div><Label>Special Instructions</Label><Textarea {...register('notes')} placeholder="Fragile cargo, specific timing..." rows={3} /></div>
              <Button type="submit" className="w-full" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? 'Posting…' : 'Post Shipment to Marketplace'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Orders (Shipper reference on browse) */}
      {mode === 'browse' && isShipperView && myOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Posted Orders</CardTitle>
              <Badge variant="secondary">{myOrders.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myOrders.slice(0, 5).map(order => (
                <div key={order._id} className="rounded-lg border border-border p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.title || order._id}</p>
                    <p className="text-xs text-muted-foreground">{order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}</p>
                  </div>
                  <Badge className={statusColor[order.status || 'OPEN']}>{order.status || 'OPEN'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{selectedOrder?.title || 'Order Details'}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColor[selectedOrder.status || 'OPEN']}>{selectedOrder.status || 'OPEN'}</Badge>
                <span className="text-xs text-muted-foreground">ID: {selectedOrder._id}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                  <p className="text-sm font-medium">{selectedOrder.pickupLocation?.city ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.pickupLocation?.address}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                  <p className="text-sm font-medium">{selectedOrder.deliveryLocation?.city ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.deliveryLocation?.address}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="text-lg font-bold">{selectedOrder.pricing?.currency ?? 'ETB'} {selectedOrder.pricing?.proposedBudget?.toLocaleString() ?? '—'}</p>
              </div>
              {selectedOrder.createdAt && (
                <p className="text-xs text-muted-foreground">Posted: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              )}
              <div className="flex gap-2">
                {isDriverView && selectedOrder.status === 'OPEN' && (
                  <Button className="flex-1" onClick={() => {
                    setProposalOrderId(selectedOrder._id);
                    setShowProposalForm(true);
                    setSelectedOrder(null);
                  }}>
                    <Send className="h-4 w-4 mr-2" /> Submit Proposal
                  </Button>
                )}
                <Button variant="ghost" className="flex-1" onClick={() => toggleWishlist(selectedOrder._id)}>
                  <Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedOrder._id) ? 'fill-primary text-primary' : ''}`} />
                  {wishlist.includes(selectedOrder._id) ? 'Remove from Saved' : 'Save Load'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proposal Submission Dialog */}
      <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit Proposal</DialogTitle></DialogHeader>
          <form onSubmit={proposalForm.handleSubmit(handleSubmitProposal)} className="space-y-4">
            <div>
              <Label>Your Proposed Price (ETB) *</Label>
              <Input type="number" {...proposalForm.register('proposedPrice', { required: true, valueAsNumber: true, min: 100 })} placeholder="4500" />
            </div>
            <div>
              <Label>Estimated Delivery Date</Label>
              <Input type="date" {...proposalForm.register('estimatedDeliveryDate')} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea {...proposalForm.register('notes')} placeholder="Available immediately, experienced with this route..." rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={submitProposalMutation.isPending}>
              {submitProposalMutation.isPending ? 'Submitting…' : 'Submit Proposal'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Shipper's proposal management view */
function ShipperProposalsView({ orders, loading }: { orders: Order[]; loading: boolean }) {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: proposalsData, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals', expandedOrder],
    queryFn: () => ordersApi.getProposals(expandedOrder!),
    enabled: !!expandedOrder,
  });

  const proposals = proposalsData?.data?.proposals || [];

  const acceptMutation = useMutation({
    mutationFn: ({ orderId, proposalId }: { orderId: string; proposalId: string }) =>
      ordersApi.acceptProposal(orderId, proposalId),
    onSuccess: () => {
      toast.success('Proposal accepted!');
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to accept'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orderId, proposalId }: { orderId: string; proposalId: string }) =>
      ordersApi.rejectProposal(orderId, proposalId),
    onSuccess: () => {
      toast.success('Proposal rejected');
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to reject'),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Manage Proposals for Your Orders</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found. Post a load first.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order._id} className="rounded-lg border border-border overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">{order.pickupLocation?.city} → {order.deliveryLocation?.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor[order.status || 'OPEN']}>{order.status}</Badge>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {expandedOrder === order._id && (
                    <div className="border-t border-border p-4 bg-muted/20">
                      {loadingProposals ? (
                        <p className="text-sm text-muted-foreground">Loading proposals…</p>
                      ) : proposals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No proposals received yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {proposals.map((p: any) => (
                            <div key={p._id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{p.driverName || p.driverId || 'Driver'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Price: {p.proposedPrice?.toLocaleString()} ETB
                                  {p.estimatedDeliveryDate && ` • ETA: ${new Date(p.estimatedDeliveryDate).toLocaleDateString()}`}
                                </p>
                                {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                              </div>
                              <div className="flex gap-2">
                                {(!p.status || p.status === 'PENDING') && (
                                  <>
                                    <Button size="sm" disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate({ orderId: order._id, proposalId: p._id })}>
                                      <Check className="h-3 w-3 mr-1" /> Accept
                                    </Button>
                                    <Button size="sm" variant="outline" disabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate({ orderId: order._id, proposalId: p._id })}>
                                      <XCircle className="h-3 w-3 mr-1" /> Reject
                                    </Button>
                                  </>
                                )}
                                {p.status && p.status !== 'PENDING' && (
                                  <Badge variant={p.status === 'ACCEPTED' ? 'default' : 'destructive'}>{p.status}</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
