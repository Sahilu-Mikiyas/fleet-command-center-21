import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Users, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileUpload } from '@/components/shared/FileUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { driverApi } from '@/services/api/driver';
import { companyApi } from '@/services/api/company';
import { toast } from 'sonner';

const driverSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(6),
  licenseNumber: z.string().min(1),
  status: z.string().optional(),
});

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [driverPhoto, setDriverPhoto] = useState<File | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getCompanies,
  });

  const companyId = companies[0]?._id;

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers', companyId],
    queryFn: () => companyId ? driverApi.getCompanyDrivers(companyId) : Promise.resolve([]),
    enabled: !!companyId,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(driverSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => driverApi.createDriver(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver added');
      setOpen(false);
      reset();
      setDriverPhoto(null);
      setLicensePhoto(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      driverPhoto: driverPhoto || undefined,
      licensePhoto: licensePhoto || undefined,
    });
  };

  const filtered = drivers.filter((d) => {
    const matchSearch = d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = drivers.filter((d) => d.status === 'ACTIVE').length;
  const pending = drivers.filter((d) => d.status === 'PENDING').length;
  const suspended = drivers.filter((d) => d.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Drivers</h1>
          <p className="text-sm text-muted-foreground">{drivers.length} total drivers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={!companyId}>
              <Plus className="h-4 w-4 mr-2" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <Input {...register('fullName')} className="h-11" />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input {...register('phoneNumber')} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input {...register('email')} type="email" className="h-11" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password</label>
                  <Input {...register('password')} type="password" className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">License Number</label>
                  <Input {...register('licenseNumber')} className="h-11" />
                </div>
              </div>
              <FileUpload onFileSelect={setDriverPhoto} label="Driver Photo" />
              <FileUpload onFileSelect={setLicensePhoto} label="License Photo" />
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 gradient-primary text-primary-foreground">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Driver'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={drivers.length} icon={Users} />
        <StatCard title="Active" value={active} icon={Users} />
        <StatCard title="Pending" value={pending} icon={Users} />
        <StatCard title="Suspended" value={suspended} icon={Users} />
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search drivers..." className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : !companyId ? (
        <EmptyState icon={Users} title="No company found" description="Create a company first to manage drivers." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No drivers found" description="Add your first driver to get started." actionLabel="Add Driver" onAction={() => setOpen(true)} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Driver</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d, i) => (
                <motion.tr key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={d.driverPhoto} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{d.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{d.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{d.phoneNumber}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.licenseNumber}</TableCell>
                  <TableCell><StatusBadge status={d.status} pulse={d.status === 'ACTIVE'} /></TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
