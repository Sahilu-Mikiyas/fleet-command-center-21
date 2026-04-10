import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ordersApi } from '@/services/api/ordersApi';
import { brokerApi } from '@/services/api/brokerApi';
import type { Order } from '@/types';

const assignmentModes: Array<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'> = [
  'DIRECT_COMPANY',
  'DIRECT_PRIVATE_TRANSPORTER',
];

export default function BrokerPage() {
  const { data: marketplaceData, isLoading: loadingMarketplace } = useQuery({
    queryKey: ['broker', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const orders: Order[] = marketplaceData?.data?.orders || [];
  const [orderId, setOrderId] = useState('');
  const [mode, setMode] = useState<'DIRECT_COMPANY' | 'DIRECT_PRIVATE_TRANSPORTER'>('DIRECT_COMPANY');
  const [targetId, setTargetId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const matchMutation = useMutation({
    mutationFn: (id: string) => brokerApi.matchCandidates(id),
    onSuccess: (data) => setSelectedMatch(data.data),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: any) => brokerApi.assignOrder(payload),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => brokerApi.validateOrder(id),
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ orderId, vehicleId }: { orderId: string; vehicleId: string }) => brokerApi.assignVehicle(orderId, vehicleId),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="text-xl">Broker Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage validation, assignment, and matching for marketplace orders.</p>
        </CardContent>
      </motion.div>

      <Card>
        <CardHeader><CardTitle>Marketplace orders</CardTitle></CardHeader>
        <CardContent>
          {loadingMarketplace ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-border p-4">
                  <p className="font-semibold">{order.title || order._id}</p>
                  <p className="text-xs text-muted-foreground">Status: {order.status || 'OPEN'}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mt-2">
                    <span className="border border-border px-2 py-1">Pickup: {order.pickupLocation?.city || '—'}</span>
                    <span className="border border-border px-2 py-1">Delivery: {order.deliveryLocation?.city || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Match & Validation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Order ID</Label>
            <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Enter order ID" />
          </div>
          <Button size="sm" disabled={!orderId || matchMutation.isPending} onClick={() => matchMutation.mutate(orderId)}>
            {matchMutation.isPending ? 'Matching…' : 'Fetch candidates'}
          </Button>
          {selectedMatch && (
            <div className="rounded-2xl border border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Candidates for {selectedMatch.order?.orderNumber || orderId}</p>
              <p className="text-xs text-muted-foreground">{selectedMatch.candidates.length} matches returned.</p>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Button size="sm" variant="secondary" disabled={!orderId || validateMutation.isPending} onClick={() => validateMutation.mutate(orderId)}>
              {validateMutation.isPending ? 'Validating…' : 'Trigger validation'}
            </Button>
            <Button size="sm" variant="ghost" disabled={!orderId || assignVehicleMutation.isPending} onClick={() => assignVehicleMutation.mutate({ orderId, vehicleId })}>
              {assignVehicleMutation.isPending ? 'Assigning Vehicle…' : 'Assign Vehicle'}
            </Button>
          </div>
          <div>
            <Label>Vehicle ID (optional)</Label>
            <Input value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="Vehicle ID" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Order assignment</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <Label>Assignment mode</Label>
              <select className="w-full rounded-lg border border-border/70 bg-background px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                {assignmentModes.map((modeOption) => (
                  <option key={modeOption} value={modeOption}>{modeOption}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{mode === 'DIRECT_COMPANY' ? 'Target company ID' : 'Target transporter ID'}</Label>
              <Input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Paste target ID" />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="w-full" disabled={!orderId || !targetId || assignMutation.isPending} onClick={() => assignMutation.mutate({
                orderId,
                assignmentMode: mode,
                targetCompanyId: mode === 'DIRECT_COMPANY' ? targetId : undefined,
                targetTransporterId: mode === 'DIRECT_PRIVATE_TRANSPORTER' ? targetId : undefined,
              })}>
                {assignMutation.isPending ? 'Assigning…' : 'Assign order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
