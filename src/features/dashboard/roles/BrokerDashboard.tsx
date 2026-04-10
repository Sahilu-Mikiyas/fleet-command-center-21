import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Search, CheckCircle2, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/services/api/ordersApi';
import { brokerApi, type BrokerAssignPayload } from '@/services/api/brokerApi';
import { toast } from '@/hooks/use-toast';
import type { Order } from '@/types';

const assignmentModes: Array<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'> = [
  'DIRECT_COMPANY',
  'DIRECT_PRIVATE_TRANSPORTER',
];

export default function BrokerDashboard() {
  const { user } = useAuth();

  const { data: marketplaceRes, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['broker', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const orders: Order[] = marketplaceRes?.data?.orders || [];
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [mode, setMode] = useState<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'>('DIRECT_COMPANY');
  const [targetId, setTargetId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [filterText, setFilterText] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);

  const filteredOrders = useMemo(() => {
    if (!filterText) return orders;
    const lower = filterText.toLowerCase();
    return orders.filter(o =>
      (o.title || '').toLowerCase().includes(lower) ||
      (o.pickupLocation?.city || '').toLowerCase().includes(lower) ||
      (o.deliveryLocation?.city || '').toLowerCase().includes(lower)
    );
  }, [marketplaceRes, filterText]);

  const matchMutation = useMutation({
    mutationFn: (id: string) => brokerApi.matchCandidates(id),
    onSuccess: (data) => {
      setMatchResult(data.data);
      toast({ title: `${data.data?.candidates?.length || 0} candidates found` });
    },
    onError: () => toast({ title: 'Match failed', variant: 'destructive' }),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => brokerApi.validateOrder(id),
    onSuccess: () => toast({ title: 'Order validated' }),
    onError: () => toast({ title: 'Validation failed', variant: 'destructive' }),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: BrokerAssignPayload) => brokerApi.assignOrder(payload),
    onSuccess: () => { toast({ title: 'Order assigned' }); setTargetId(''); },
    onError: () => toast({ title: 'Assignment failed', variant: 'destructive' }),
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ orderId, vehicleId }: { orderId: string; vehicleId: string }) => brokerApi.assignVehicle(orderId, vehicleId),
    onSuccess: () => { toast({ title: 'Vehicle assigned' }); setVehicleId(''); },
    onError: () => toast({ title: 'Vehicle assignment failed', variant: 'destructive' }),
  });

  // KPIs
  const openOrders = orders.filter(o => o.status === 'OPEN').length;
  const assignedOrders = orders.filter(o => o.status === 'ASSIGNED').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Broker'} 👋
          </h1>
          <p className="text-muted-foreground">Validate orders, match carriers, assign loads, and monitor performance</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Marketplace" value={orders.length} icon={ShoppingCart} subtitle="All orders" />
        <StatCard title="Open" value={openOrders} icon={AlertCircle} subtitle="Awaiting assignment" />
        <StatCard title="Assigned" value={assignedOrders} icon={CheckCircle2} subtitle="In progress" />
        <StatCard title="Delivered" value={deliveredOrders} icon={TrendingUp} subtitle="Completed" />
      </div>

      {/* Live Marketplace with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Live Marketplace</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by title or city…" value={filterText} onChange={e => setFilterText(e.target.value)} className="max-w-xs" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMarketplace ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders match your filter.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredOrders.map(order => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrderId(order._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedOrderId === order._id ? 'border-primary bg-primary/5' : 'border-border bg-muted/50 hover:bg-muted'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.title || order._id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'OPEN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {order.status || 'OPEN'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match & Validation + Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match & Validate */}
        <Card>
          <CardHeader><CardTitle>Match & Validation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Selected Order ID</Label>
              <Input value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} placeholder="Select from list or paste ID" />
            </div>
            <div className="flex gap-3">
              <Button size="sm" disabled={!selectedOrderId || matchMutation.isPending} onClick={() => matchMutation.mutate(selectedOrderId)}>
                {matchMutation.isPending ? 'Matching…' : 'Fetch Candidates'}
              </Button>
              <Button size="sm" variant="secondary" disabled={!selectedOrderId || validateMutation.isPending} onClick={() => validateMutation.mutate(selectedOrderId)}>
                {validateMutation.isPending ? 'Validating…' : 'Validate Order'}
              </Button>
            </div>
            {matchResult && (
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground mb-2">
                  {matchResult.candidates?.length || 0} candidates for {matchResult.order?.orderNumber || selectedOrderId}
                </p>
                {matchResult.candidates?.map((c: any, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground py-1 border-b border-border last:border-0">
                    {c.companyName || c.name || c._id || `Candidate ${i + 1}`}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Form */}
        <Card>
          <CardHeader><CardTitle>Assign Order</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Assignment Mode</Label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2" value={mode} onChange={e => setMode(e.target.value as any)}>
                {assignmentModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label>{mode === 'DIRECT_COMPANY' ? 'Target Company ID' : 'Target Transporter ID'}</Label>
              <Input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Paste target ID" />
            </div>
            <Button className="w-full" disabled={!selectedOrderId || !targetId || assignMutation.isPending} onClick={() => assignMutation.mutate({
              orderId: selectedOrderId,
              assignmentMode: mode,
              targetCompanyId: mode === 'DIRECT_COMPANY' ? targetId : undefined,
              targetTransporterId: mode === 'DIRECT_PRIVATE_TRANSPORTER' ? targetId : undefined,
            })}>
              {assignMutation.isPending ? 'Assigning…' : 'Assign Order'}
            </Button>

            <div className="border-t border-border pt-4">
              <Label>Vehicle Assignment</Label>
              <div className="flex gap-2 mt-2">
                <Input value={vehicleId} onChange={e => setVehicleId(e.target.value)} placeholder="Vehicle ID" />
                <Button size="sm" disabled={!selectedOrderId || !vehicleId || assignVehicleMutation.isPending} onClick={() => assignVehicleMutation.mutate({ orderId: selectedOrderId, vehicleId })}>
                  {assignVehicleMutation.isPending ? 'Assigning…' : 'Assign Vehicle'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
