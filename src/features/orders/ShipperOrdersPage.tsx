import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Search } from 'lucide-react';
import { ordersApi } from '@/services/api/ordersApi';
import { useNavigate } from 'react-router-dom';
import type { Order } from '@/types';

const statusColor: Record<string, string> = {
  OPEN: 'bg-primary/10 text-primary',
  MATCHED: 'bg-accent text-accent-foreground',
  ASSIGNED: 'bg-blue-500/10 text-blue-600',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-600',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-destructive/10 text-destructive',
};

export default function ShipperOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [openOrder, setOpenOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });
  const orders: Order[] = data?.data?.orders || [];

  const filtered = useMemo(() => {
    let r = [...orders];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(o =>
        o.title?.toLowerCase().includes(q) ||
        o.deliveryLocation?.city?.toLowerCase().includes(q) ||
        o._id?.toLowerCase().includes(q)
      );
    }
    if (status !== 'ALL') r = r.filter(o => o.status === status);
    if (dateRange !== 'ALL') {
      const now = Date.now();
      const cutoff = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      r = r.filter(o => o.createdAt && (now - new Date(o.createdAt).getTime()) <= cutoff * 86400000);
    }
    r.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    return r;
  }, [orders, search, status, dateRange]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" /> My Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your loads and monitor delivery status.</p>
          </div>
          <Button onClick={() => navigate('/marketplace')}>
            <Plus className="h-4 w-4 mr-1" /> Create Order
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title, city, or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="MATCHED">Matched</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="IN_TRANSIT">In transit</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">Loading orders…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No orders match your filters.</TableCell></TableRow>
              ) : filtered.map(o => (
                <TableRow key={o._id} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenOrder(o)}>
                  <TableCell className="font-mono text-xs">{o._id?.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{o.title || '—'}</TableCell>
                  <TableCell>{o.deliveryLocation?.city || '—'}</TableCell>
                  <TableCell><Badge className={statusColor[o.status || 'OPEN']}>{o.status || 'OPEN'}</Badge></TableCell>
                  <TableCell>{o.pricing?.currency || 'ETB'} {o.pricing?.proposedBudget?.toLocaleString() || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!openOrder} onOpenChange={(o) => !o && setOpenOrder(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader><SheetTitle>{openOrder?.title || 'Order'}</SheetTitle></SheetHeader>
          {openOrder && (
            <div className="space-y-4 mt-4 text-sm">
              <div><p className="text-xs uppercase text-muted-foreground">Order ID</p><p className="font-mono">{openOrder._id}</p></div>
              <div><p className="text-xs uppercase text-muted-foreground">Status</p><Badge className={statusColor[openOrder.status || 'OPEN']}>{openOrder.status || 'OPEN'}</Badge></div>
              <div><p className="text-xs uppercase text-muted-foreground">Pickup</p><p>{openOrder.pickupLocation?.address}, {openOrder.pickupLocation?.city}</p></div>
              <div><p className="text-xs uppercase text-muted-foreground">Delivery</p><p>{openOrder.deliveryLocation?.address}, {openOrder.deliveryLocation?.city}</p></div>
              <div><p className="text-xs uppercase text-muted-foreground">Budget</p><p>{openOrder.pricing?.currency} {openOrder.pricing?.proposedBudget?.toLocaleString()}</p></div>
              <Button className="w-full" onClick={() => navigate('/tracking')}>View live tracking</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
