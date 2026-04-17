import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, MapPin } from 'lucide-react';
import { driverApi } from '@/services/api/driver';

export default function DriverTripHistoryPage() {
  const [open, setOpen] = useState<any>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'trip-history'],
    queryFn: () => driverApi.getTripHistory(),
  });
  const trips: any[] = data?.data?.trips || data?.data || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Trip History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review past trips, distance covered, and earnings.</p>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">Loading trips…</TableCell></TableRow>
              ) : trips.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">No completed trips yet.</TableCell></TableRow>
              ) : trips.map((t: any) => (
                <TableRow key={t._id} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpen(t)}>
                  <TableCell className="font-mono text-xs">{t._id?.slice(-8)}</TableCell>
                  <TableCell className="text-xs">{t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-sm">{t.pickupLocation?.city ?? '—'} → {t.deliveryLocation?.city ?? '—'}</TableCell>
                  <TableCell>{t.distanceKm ? `${t.distanceKm} km` : '—'}</TableCell>
                  <TableCell>ETB {t.earnings?.toLocaleString() || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Trip Details</SheetTitle></SheetHeader>
          {open && (
            <div className="space-y-3 mt-4 text-sm">
              <p className="font-mono text-xs">{open._id}</p>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {open.pickupLocation?.city} → {open.deliveryLocation?.city}</div>
              <p>Distance: {open.distanceKm || '—'} km</p>
              <p>Earnings: ETB {open.earnings?.toLocaleString() || '—'}</p>
              <p>Completed: {open.completedAt ? new Date(open.completedAt).toLocaleString() : '—'}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
