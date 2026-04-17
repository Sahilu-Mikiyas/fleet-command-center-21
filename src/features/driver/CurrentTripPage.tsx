import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { driverApi } from '@/services/api/driver';
import { PlaceholderMap } from '@/components/shared/PlaceholderMap';
import { toast } from 'sonner';

export default function CurrentTripPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'assignments'],
    queryFn: () => driverApi.getAssignments(),
  });

  const assignments = (data as any[]) || [];
  const current = assignments.find((a: any) => ['ASSIGNED', 'IN_TRANSIT', 'AT_PICKUP'].includes(a.status)) || assignments[0];

  const action = (fn: () => Promise<any>, label: string) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => {
        toast.success(`${label} updated`);
        queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
      },
      onError: (err: any) => toast.error(err.message || `Failed to ${label.toLowerCase()}`),
    });

  const startMut = action(() => driverApi.startAssignment(current?._id || ''), 'Trip started');
  const arriveMut = action(() => driverApi.arriveAtPickup(current?._id || ''), 'Arrived at pickup');
  const completeMut = action(() => driverApi.completeAssignment(current?._id || ''), 'Trip completed');

  if (isLoading) return <Card className="p-8 text-center text-sm text-muted-foreground">Loading current trip…</Card>;

  if (!current) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No active trip. Browse the marketplace to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" /> Current Trip
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{current.title || 'Active assignment'}</p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-600">{current.status}</Badge>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlaceholderMap
            title="Trip route"
            subtitle={`${current.pickupLocation?.city} → ${current.deliveryLocation?.city}`}
          />
        </div>
        <Card>
          <CardHeader><CardTitle>Trip details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5" /><div><p className="font-medium">Pickup</p><p className="text-xs text-muted-foreground">{current.pickupLocation?.address}</p></div></div>
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5" /><div><p className="font-medium">Destination</p><p className="text-xs text-muted-foreground">{current.deliveryLocation?.address}</p></div></div>
            <div className="border-t pt-3 space-y-2">
              <Button className="w-full" variant="outline" size="sm"><Phone className="h-4 w-4 mr-1" /> Contact dispatcher</Button>
              {current.status === 'ASSIGNED' && (
                <Button className="w-full" onClick={() => startMut.mutate()} disabled={startMut.isPending}><Play className="h-4 w-4 mr-1" /> Start trip</Button>
              )}
              {current.status === 'IN_TRANSIT' && (
                <Button className="w-full" onClick={() => arriveMut.mutate()} disabled={arriveMut.isPending}>Arrived at pickup</Button>
              )}
              {(current.status === 'IN_TRANSIT' || current.status === 'AT_PICKUP') && (
                <Button className="w-full" variant="default" onClick={() => completeMut.mutate()} disabled={completeMut.isPending}><CheckCircle2 className="h-4 w-4 mr-1" /> Mark delivered</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
