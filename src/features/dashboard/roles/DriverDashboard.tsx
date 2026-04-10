import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, DollarSign, Navigation, Phone, Truck, ToggleLeft, ToggleRight, Package, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { driverApi } from '@/services/api/driver';
import { toast } from '@/hooks/use-toast';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [driverStatus, setDriverStatus] = useState<string>(user?.isAvailable ? 'ACTIVE' : 'OFFLINE');

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['driver', 'assignments'],
    queryFn: () => driverApi.getAssignments(),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => driverApi.updateStatus(status),
    onSuccess: (_data, status) => {
      setDriverStatus(status);
      toast({ title: `Status updated to ${status}` });
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
  });

  const toggleStatus = () => {
    const next = driverStatus === 'ACTIVE' ? 'OFFLINE' : 'ACTIVE';
    statusMutation.mutate(next);
  };

  const currentAssignment = assignments[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-1">
              {greeting()}, {user?.fullName?.split(' ')[0] || 'Driver'} 👋
            </h1>
            <p className="text-muted-foreground">
              Track assignments, manage availability, and view earnings
            </p>
          </div>
          {/* Status Toggle */}
          <Button
            variant={driverStatus === 'ACTIVE' ? 'default' : 'outline'}
            onClick={toggleStatus}
            disabled={statusMutation.isPending}
            className="flex items-center gap-2"
          >
            {driverStatus === 'ACTIVE' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {statusMutation.isPending ? 'Updating…' : driverStatus}
          </Button>
        </div>
      </motion.div>

      {/* Current Assignment */}
      {currentAssignment ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-display mb-1">Current Assignment</h3>
              <p className="text-sm text-muted-foreground">ID: {currentAssignment._id || currentAssignment.id}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="font-semibold text-foreground">{currentAssignment.pickupLocation?.city || currentAssignment.pickup || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-semibold text-foreground">{currentAssignment.deliveryLocation?.city || currentAssignment.destination || '—'}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button className="flex-1" asChild>
              <Link to="/tracking">
                <Navigation className="h-4 w-4 mr-2" />Open Tracking
              </Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />Contact Dispatcher
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 text-center"
        >
          <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {loadingAssignments ? 'Loading assignments…' : 'No current assignments. Stay available for new loads!'}
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
                  <p className="text-3xl font-bold text-foreground">{assignments.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-3xl font-bold text-foreground">{driverStatus}</p>
                </div>
                {driverStatus === 'ACTIVE' ? <ToggleRight className="h-8 w-8 text-primary opacity-20" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground opacity-20" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                  <p className="text-lg font-bold text-foreground">—</p>
                  <p className="text-xs text-muted-foreground">Assign via fleet page</p>
                </div>
                <Truck className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                  <p className="text-lg font-bold text-foreground">—</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/tracking">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Open Tracking</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Mark Delivered</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link to="/payments">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Wallet / Payouts</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Contact Dispatcher</span>
          </Button>
        </div>
      </motion.div>

      {/* All Assignments */}
      {assignments.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">All Assignments ({assignments.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.map((a: any, i: number) => (
              <div key={a._id || i} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title || a._id || `Assignment ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{a.status || '—'}</p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
