import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Truck, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { vehicleApi } from '@/services/api/vehicle';
import { toast } from 'sonner';

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Required'),
  vehicleType: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  capacityKg: z.coerce.number().positive('Must be positive'),
  status: z.string().optional(),
});

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getCompanyVehicles,
  });

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vehicleSchema),
  });

  const createMutation = useMutation({
    mutationFn: vehicleApi.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle added');
      setOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: any) => createMutation.mutate(data);

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const inactive = vehicles.filter((v) => v.status === 'INACTIVE').length;
  const maintenance = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} total vehicles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plate Number</label>
                <Input {...register('plateNumber')} className="h-11" placeholder="ABC-1234" />
                {errors.plateNumber && <p className="text-xs text-destructive mt-1">{errors.plateNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Vehicle Type</label>
                  <Input {...register('vehicleType')} className="h-11" placeholder="Truck, Van..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Model</label>
                  <Input {...register('model')} className="h-11" placeholder="Model name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Capacity (kg)</label>
                  <Input {...register('capacityKg')} type="number" className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select onValueChange={(v) => setValue('status', v)} defaultValue="ACTIVE">
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 gradient-primary text-primary-foreground">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={vehicles.length} icon={Truck} />
        <StatCard title="Active" value={active} icon={Truck} />
        <StatCard title="Inactive" value={inactive} icon={Truck} />
        <StatCard title="Maintenance" value={maintenance} icon={Truck} />
      </motion.div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search plate or model..." className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No vehicles found" description="Add your first vehicle to get started." actionLabel="Add Vehicle" onAction={() => setOpen(true)} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Plate Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v, i) => (
                <motion.tr
                  key={v._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{v.plateNumber}</TableCell>
                  <TableCell>{v.vehicleType}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.capacityKg} kg</TableCell>
                  <TableCell><StatusBadge status={v.status} pulse={v.status === 'ACTIVE'} /></TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
