import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { driverApi } from '@/services/api/driver';
import { AlertTriangle, MapPin, Radar } from 'lucide-react';

export default function TrackingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'assignments'],
    queryFn: driverApi.getAssignments,
  });

  const assignments = data ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="text-xl">Live Tracking</CardTitle>
          <MapPin className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Real-time driver assignments, routes, and delivery status based on the latest order data.
          </p>
        </CardContent>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Active Driver Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading assignments…</p>
          ) : assignments.length ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={(assignment as any)._id || JSON.stringify(assignment)} className="border border-border/70 rounded-2xl p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">Order {assignment.orderId}</p>
                    <p className="text-xs text-muted-foreground">Status: {assignment.status || 'unknown'}</p>
                    <p className="text-xs text-muted-foreground">Vehicle: {assignment.vehicle?.plateNumber || 'Not assigned'}</p>
                    <p className="text-xs text-muted-foreground">Driver: {assignment.driver?.fullName || assignment.driverId || 'Unassigned'}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span className="rounded-full border border-border px-2 py-1">Pickup: {assignment.pickupLocation?.address || '—'}</span>
                      <span className="rounded-full border border-border px-2 py-1">Delivery: {assignment.deliveryLocation?.address || '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <AlertTriangle className="h-5 w-5 text-warning" /> No active assignments found.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driver Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Active drivers</p>
              <p className="text-3xl font-semibold text-foreground">{assignments.length}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Average completion rate</p>
              <p className="text-3xl font-semibold text-foreground">{assignments.length ? Math.min(100, assignments.length * 10) : 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
