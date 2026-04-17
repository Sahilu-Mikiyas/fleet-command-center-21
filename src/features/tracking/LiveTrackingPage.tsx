import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Navigation, Clock, MapPin, Truck } from 'lucide-react';
import { ordersApi } from '@/services/api/ordersApi';
import { PlaceholderMap } from '@/components/shared/PlaceholderMap';
import { useAuth } from '@/context/AuthContext';

const statusColor: Record<string, string> = {
  OPEN: 'bg-primary/10 text-primary',
  ASSIGNED: 'bg-blue-500/10 text-blue-600',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-600',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600',
};

export default function LiveTrackingPage() {
  const { userRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
    enabled: ['SHIPPER', 'VENDOR'].includes(userRole ?? ''),
  });

  const { data: marketplaceData } = useQuery({
    queryKey: ['orders', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const myOrders = mineData?.data?.orders || [];
  const allOrders = marketplaceData?.data?.orders || [];
  const orders = ['SHIPPER', 'VENDOR'].includes(userRole ?? '') ? myOrders : allOrders;
  const selected = orders.find(o => o._id === selectedId) || orders[0];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" /> Live Tracking
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor active shipments in real time.</p>
          </div>
          <Select value={selected?._id || ''} onValueChange={setSelectedId}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Select an order" /></SelectTrigger>
            <SelectContent>
              {orders.map(o => (
                <SelectItem key={o._id} value={o._id}>{o.title || o._id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {loadingMine ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading shipments…</Card>
      ) : !selected ? (
        <Card className="p-8 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No active shipment to track.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlaceholderMap
              title={selected.title || 'Shipment'}
              subtitle={`${selected.pickupLocation?.city ?? '—'} → ${selected.deliveryLocation?.city ?? '—'}`}
              markers={[
                { label: 'Pickup', sub: selected.pickupLocation?.address },
                { label: 'Destination', sub: selected.deliveryLocation?.address },
              ]}
            />
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4" /> Shipment status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Badge className={statusColor[selected.status || 'OPEN'] || 'bg-muted'}>{selected.status || 'OPEN'}</Badge>
              <div className="space-y-3 pt-2">
                {[
                  { key: 'OPEN', label: 'Order created' },
                  { key: 'ASSIGNED', label: 'Driver assigned' },
                  { key: 'IN_TRANSIT', label: 'In transit' },
                  { key: 'DELIVERED', label: 'Delivered' },
                ].map((step, i, arr) => {
                  const idx = arr.findIndex(s => s.key === selected.status);
                  const reached = i <= (idx === -1 ? 0 : idx);
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${reached ? 'bg-primary' : 'bg-muted'}`} />
                      <p className={`text-sm ${reached ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                <Clock className="h-3 w-3" />
                Last updated: just now
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
