import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, DollarSign, Navigation, Phone, Truck, ToggleLeft, ToggleRight,
  Package, CheckCircle2, Play, Flag, History, Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { driverApi } from '@/services/api/driver';
import { toast } from 'sonner';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  ASSIGNED: 'bg-primary/10 text-primary',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-600',
  ARRIVED: 'bg-blue-500/10 text-blue-600',
  COMPLETED: 'bg-muted text-muted-foreground',
  REJECTED: 'bg-destructive/10 text-destructive',
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [driverStatus, setDriverStatus] = useState<string>(user?.isAvailable ? 'ACTIVE' : 'OFFLINE');

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['driver', 'assignments'],
    queryFn: () => driverApi.getAssignments(),
  });

  const { data: commissionData } = useQuery({
    queryKey: ['driver', 'commission'],
    queryFn: () => driverApi.getCommission(),
  });

  const { data: tripHistory } = useQuery({
    queryKey: ['driver', 'trips'],
    queryFn: () => driverApi.getTripHistory(),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => driverApi.updateStatus(status, status === 'ACTIVE'),
    onSuccess: (_data, status) => {
      setDriverStatus(status);
      toast.success(`Status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update status'),
  });

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => driverApi.acceptAssignment(orderId),
    onSuccess: () => {
      toast.success('Assignment accepted');
      queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to accept'),
  });

  const rejectMutation = useMutation({
    mutationFn: (orderId: string) => driverApi.rejectAssignment(orderId),
    onSuccess: () => {
      toast.success('Assignment rejected');
      queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to reject'),
  });

  const startMutation = useMutation({
    mutationFn: (orderId: string) => driverApi.startAssignment(orderId),
    onSuccess: () => {
      toast.success('Trip started');
      queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to start trip'),
  });

  const arriveMutation = useMutation({
    mutationFn: (orderId: string) => driverApi.arriveAtPickup(orderId),
    onSuccess: () => {
      toast.success('Arrival marked');
      queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to mark arrival'),
  });

  const completeMutation = useMutation({
    mutationFn: (orderId: string) => driverApi.completeAssignment(orderId),
    onSuccess: () => {
      toast.success('Delivery completed!');
      queryClient.invalidateQueries({ queryKey: ['driver', 'assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to complete'),
  });

  const toggleStatus = () => {
    const next = driverStatus === 'ACTIVE' ? 'OFFLINE' : 'ACTIVE';
    statusMutation.mutate(next);
  };

  const currentAssignment = assignments[0];
  const trips = tripHistory?.data?.trips || [];
  const totalCommission = commissionData?.data?.totalCommission ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getAssignmentActions = (assignment: any) => {
    const id = assignment.orderId || assignment._id;
    const status = assignment.status?.toUpperCase();
    const actions: Array<{ label: string; icon: any; onClick: () => void; variant?: any; disabled?: boolean }> = [];

    if (status === 'ASSIGNED' || status === 'PENDING') {
      actions.push({
        label: 'Accept',
        icon: CheckCircle2,
        onClick: () => acceptMutation.mutate(id),
        disabled: acceptMutation.isPending,
      });
      actions.push({
        label: 'Reject',
        icon: Flag,
        onClick: () => rejectMutation.mutate(id),
        variant: 'outline' as const,
        disabled: rejectMutation.isPending,
      });
    }
    if (status === 'ACCEPTED') {
      actions.push({
        label: 'Start Trip',
        icon: Play,
        onClick: () => startMutation.mutate(id),
        disabled: startMutation.isPending,
      });
    }
    if (status === 'IN_TRANSIT' || status === 'STARTED') {
      actions.push({
        label: 'Mark Arrived',
        icon: MapPin,
        onClick: () => arriveMutation.mutate(id),
        disabled: arriveMutation.isPending,
      });
    }
    if (status === 'ARRIVED') {
      actions.push({
        label: 'Complete Delivery',
        icon: CheckCircle2,
        onClick: () => completeMutation.mutate(id),
        disabled: completeMutation.isPending,
      });
    }
    return actions;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header + Status Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-1">
              {greeting()}, {user?.fullName?.split(' ')[0] || 'Driver'} 👋
            </h1>
            <p className="text-muted-foreground">
              Track assignments, manage availability, and view earnings
            </p>
          </div>
          <Button
            size="lg"
            variant={driverStatus === 'ACTIVE' ? 'default' : 'outline'}
            onClick={toggleStatus}
            disabled={statusMutation.isPending}
            className="flex items-center gap-2 min-w-[140px]"
          >
            {driverStatus === 'ACTIVE' ? (
              <ToggleRight className="h-5 w-5" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
            {statusMutation.isPending ? 'Updating…' : driverStatus === 'ACTIVE' ? 'Online' : 'Offline'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assignments</p>
                  <p className="text-3xl font-bold text-foreground">{assignments.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className={`text-xl font-bold ${driverStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {driverStatus === 'ACTIVE' ? '🟢 Online' : '⚫ Offline'}
                  </p>
                </div>
                {driverStatus === 'ACTIVE' ? <ToggleRight className="h-8 w-8 text-emerald-500/30" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground/20" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed Trips</p>
                  <p className="text-3xl font-bold text-foreground">{trips.length}</p>
                </div>
                <History className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalCommission ? `${totalCommission.toLocaleString()} ETB` : '—'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Current Assignment */}
      {currentAssignment ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-display mb-1">Current Assignment</h3>
              <p className="text-sm text-muted-foreground">
                ID: {currentAssignment.orderId || currentAssignment._id}
              </p>
            </div>
            <Badge className={statusColors[currentAssignment.status?.toUpperCase()] || 'bg-primary/10 text-primary'}>
              {currentAssignment.status || 'Active'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="font-semibold text-foreground">
                  {currentAssignment.pickupLocation?.city || currentAssignment.pickup || '—'}
                </p>
                {currentAssignment.pickupLocation?.address && (
                  <p className="text-xs text-muted-foreground">{currentAssignment.pickupLocation.address}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-semibold text-foreground">
                  {currentAssignment.deliveryLocation?.city || currentAssignment.destination || '—'}
                </p>
                {currentAssignment.deliveryLocation?.address && (
                  <p className="text-xs text-muted-foreground">{currentAssignment.deliveryLocation.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Actions */}
          <div className="flex flex-wrap gap-3">
            {getAssignmentActions(currentAssignment).map((action, i) => (
              <Button
                key={i}
                variant={action.variant || 'default'}
                disabled={action.disabled}
                onClick={action.onClick}
                className="flex-1 min-w-[120px]"
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
            <Button variant="outline" className="flex-1 min-w-[120px]" asChild>
              <Link to="/tracking">
                <Navigation className="h-4 w-4 mr-2" />Open Tracking
              </Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            {loadingAssignments ? 'Loading assignments…' : 'No current assignments. Browse the marketplace for available loads!'}
          </p>
          <Button asChild>
            <Link to="/marketplace">Browse Marketplace</Link>
          </Button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
            <Link to="/marketplace">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Browse Loads</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
            <Link to="/tracking">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Open Tracking</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
            <Link to="/payments">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Wallet / Payouts</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Contact Dispatcher</span>
          </Button>
        </div>
      </motion.div>

      {/* All Assignments */}
      {assignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">
            All Assignments ({assignments.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {assignments.map((a: any, i: number) => {
              const id = a.orderId || a._id || i;
              const actions = getAssignmentActions(a);
              return (
                <div key={id} className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {a.title || a.orderId || `Assignment ${i + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.pickupLocation?.city ?? '—'} → {a.deliveryLocation?.city ?? '—'}
                      </p>
                    </div>
                    <Badge className={statusColors[a.status?.toUpperCase()] || 'bg-muted text-muted-foreground'}>
                      {a.status || '—'}
                    </Badge>
                  </div>
                  {actions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {actions.map((action, j) => (
                        <Button key={j} size="sm" variant={action.variant || 'default'} disabled={action.disabled} onClick={action.onClick}>
                          <action.icon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Trip History */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold font-display">Trip History</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trips.slice(0, 10).map((trip: any, i: number) => (
              <div key={trip._id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{trip.orderId || `Trip ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                <Badge variant="secondary">{trip.status || 'Completed'}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
