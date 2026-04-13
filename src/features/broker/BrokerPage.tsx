import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ordersApi } from '@/services/api/ordersApi';
import { brokerApi, type BrokerAssignPayload } from '@/services/api/brokerApi';
import { StatCard } from '@/components/shared/StatCard';
import { toast } from 'sonner';
import {
  ShoppingCart, Search, CheckCircle2, TrendingUp, AlertCircle, Users, Truck, Send,
} from 'lucide-react';
import type { Order } from '@/types';

const statusColor: Record<string, string> = {
  OPEN: 'bg-primary/10 text-primary',
  MATCHED: 'bg-accent/50 text-accent-foreground',
  ASSIGNED: 'bg-blue-500/10 text-blue-600',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-600',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600',
};

export default function BrokerPage() {
  const queryClient = useQueryClient();
  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['broker', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const orders: Order[] = marketplaceData?.data?.orders || [];
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [mode, setMode] = useState<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'>('DIRECT_COMPANY');
  const [targetId, setTargetId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [matchResult, setMatchResult] = useState<any>(null);

  const filteredOrders = orders.filter(o => {
    const matchSearch = !filterText || (o.title || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (o.pickupLocation?.city || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (o.deliveryLocation?.city || '').toLowerCase().includes(filterText.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const matchMutation = useMutation({
    mutationFn: (id: string) => brokerApi.matchCandidates(id),
    onSuccess: (data) => {
      setMatchResult(data.data);
      toast.success(`${data.data?.candidates?.length || 0} candidates found`);
    },
    onError: (err: any) => toast.error(err.message || 'Match failed'),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => brokerApi.validateOrder(id),
    onSuccess: () => {
      toast.success('Order validated successfully');
      queryClient.invalidateQueries({ queryKey: ['broker', 'marketplace'] });
    },
    onError: (err: any) => toast.error(err.message || 'Validation failed'),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: BrokerAssignPayload) => brokerApi.assignOrder(payload),
    onSuccess: () => {
      toast.success('Order assigned successfully');
      setTargetId('');
      queryClient.invalidateQueries({ queryKey: ['broker', 'marketplace'] });
    },
    onError: (err: any) => toast.error(err.message || 'Assignment failed'),
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ orderId, vehicleId }: { orderId: string; vehicleId: string }) =>
      brokerApi.assignVehicle(orderId, vehicleId),
    onSuccess: () => {
      toast.success('Vehicle assigned to order');
      setVehicleId('');
    },
    onError: (err: any) => toast.error(err.message || 'Vehicle assignment failed'),
  });

  const openOrders = orders.filter(o => o.status === 'OPEN').length;
  const assignedOrders = orders.filter(o => o.status === 'ASSIGNED').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Broker Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Validate orders, match carriers, assign loads, and monitor performance</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Marketplace" value={orders.length} icon={ShoppingCart} subtitle="All orders" />
        <StatCard title="Open" value={openOrders} icon={AlertCircle} subtitle="Awaiting assignment" />
        <StatCard title="Assigned" value={assignedOrders} icon={CheckCircle2} subtitle="In progress" />
        <StatCard title="Delivered" value={deliveredOrders} icon={TrendingUp} subtitle="Completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Marketplace */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Live Marketplace</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input placeholder="Filter…" value={filterText} onChange={e => setFilterText(e.target.value)} className="pl-9 max-w-[200px]" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="MATCHED">Matched</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMarketplace ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders match your filter.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredOrders.map(order => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrderId(order._id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedOrderId === order._id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{order.title || order._id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}
                            {order.pricing?.proposedBudget && ` • ${order.pricing.proposedBudget.toLocaleString()} ETB`}
                          </p>
                        </div>
                        <Badge className={statusColor[order.status || 'OPEN'] || 'bg-muted text-muted-foreground'}>
                          {order.status || 'OPEN'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-6">
          {/* Selected Order Info */}
          <Card>
            <CardHeader><CardTitle>Selected Order</CardTitle></CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">{selectedOrder.title || selectedOrder._id}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📍 {selectedOrder.pickupLocation?.city} → {selectedOrder.deliveryLocation?.city}</p>
                    <p>💰 {selectedOrder.pricing?.proposedBudget?.toLocaleString()} {selectedOrder.pricing?.currency || 'ETB'}</p>
                    <p>Status: {selectedOrder.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={matchMutation.isPending} onClick={() => matchMutation.mutate(selectedOrderId)} className="flex-1">
                      <Users className="h-3 w-3 mr-1" />
                      {matchMutation.isPending ? 'Matching…' : 'Match Carriers'}
                    </Button>
                    <Button size="sm" variant="secondary" disabled={validateMutation.isPending} onClick={() => validateMutation.mutate(selectedOrderId)} className="flex-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {validateMutation.isPending ? 'Validating…' : 'Validate'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select an order from the marketplace list.</p>
              )}
            </CardContent>
          </Card>

          {/* Match Results */}
          {matchResult && (
            <Card>
              <CardHeader><CardTitle>Match Candidates ({matchResult.candidates?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                {matchResult.candidates?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchResult.candidates.map((c: any, i: number) => (
                        <TableRow key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => setTargetId(c._id || c.companyId || '')}>
                          <TableCell className="font-medium">{c.companyName || c.name || c._id || `Candidate ${i + 1}`}</TableCell>
                          <TableCell>{c.score || c.matchScore || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No candidates found.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment Form */}
          <Card>
            <CardHeader><CardTitle>Assign Order</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Assignment Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECT_COMPANY">Direct to Company</SelectItem>
                    <SelectItem value="DIRECT_PRIVATE_TRANSPORTER">Direct Transporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{mode === 'DIRECT_COMPANY' ? 'Company ID' : 'Transporter ID'}</Label>
                <Input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Paste target ID" />
              </div>
              <Button
                className="w-full"
                disabled={!selectedOrderId || !targetId.trim() || assignMutation.isPending}
                onClick={() => assignMutation.mutate({
                  orderId: selectedOrderId,
                  assignmentMode: mode,
                  targetCompanyId: mode === 'DIRECT_COMPANY' ? targetId.trim() : undefined,
                  targetTransporterId: mode === 'DIRECT_PRIVATE_TRANSPORTER' ? targetId.trim() : undefined,
                })}
              >
                <Send className="h-4 w-4 mr-2" />
                {assignMutation.isPending ? 'Assigning…' : 'Assign Order'}
              </Button>

              <div className="border-t border-border pt-3 mt-3">
                <Label>Vehicle Assignment</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={vehicleId} onChange={e => setVehicleId(e.target.value)} placeholder="Vehicle ID" className="flex-1" />
                  <Button size="sm" disabled={!selectedOrderId || !vehicleId.trim() || assignVehicleMutation.isPending}
                    onClick={() => assignVehicleMutation.mutate({ orderId: selectedOrderId, vehicleId: vehicleId.trim() })}>
                    <Truck className="h-3 w-3 mr-1" />
                    {assignVehicleMutation.isPending ? '…' : 'Assign'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
