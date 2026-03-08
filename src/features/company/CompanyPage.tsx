import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, Globe, Phone, Mail, MapPin, FileText, Edit, Save, X, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FileUpload } from '@/components/shared/FileUpload';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { companyApi } from '@/services/api/company';
import { toast } from 'sonner';

const companySchema = z.object({
  companyName: z.string().min(2, 'Required'),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  website: z.string().optional(),
  description: z.string().optional(),
  businessLicense: z.string().optional(),
  address: z.string().optional(),
});

export default function CompanyPage() {
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getCompanies,
  });

  const company = companies[0];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
    values: company ? {
      companyName: company.companyName,
      email: company.email,
      phoneNumber: company.phoneNumber,
      website: company.website || '',
      description: company.description || '',
      businessLicense: company.businessLicense || '',
      address: company.address || '',
    } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: companyApi.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created');
      setShowCreate(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => companyApi.updateCompany(company._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated');
      setEditing(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => companyApi.deleteCompany(company._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deactivated');
      setShowDelete(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: any) => {
    const payload = { ...data, photo: photo || undefined };
    if (company) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!company && !showCreate) {
    return (
      <EmptyState
        icon={Building2}
        title="No company profile"
        description="Create your company profile to manage your fleet operations."
        actionLabel="Create Company"
        onAction={() => setShowCreate(true)}
      />
    );
  }

  if (showCreate && !company) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold font-display mb-6">Create Company</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                <Input {...register('companyName')} className="h-11" />
                {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input {...register('email')} type="email" className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <Input {...register('phoneNumber')} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Website</label>
                <Input {...register('website')} className="h-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Address</label>
              <Input {...register('address')} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Business License</label>
              <Input {...register('businessLicense')} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea {...register('description')} rows={3} />
            </div>
            <FileUpload onFileSelect={setPhoto} label="Company Photo" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending} className="gradient-primary text-primary-foreground">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Company'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="p-8 flex items-start gap-6 relative z-10">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            {company.photo ? (
              <img src={company.photo} alt={company.companyName} className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <Building2 className="h-10 w-10 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold font-display">{company.companyName}</h1>
              <StatusBadge status={company.status} pulse={company.status === 'ACTIVE'} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {company.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{company.email}</span>}
              {company.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{company.phoneNumber}</span>}
              {company.website && <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{company.website}</span>}
              {company.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{company.address}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditing(!editing); reset(); }}>
              {editing ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Edit className="h-4 w-4 mr-1" />Edit</>}
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cars', value: company.numberOfCars || 0 },
          { label: 'Status', value: company.status },
          { label: 'Active', value: company.active ? 'Yes' : 'No' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Editable Form */}
      {editing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h3 className="text-lg font-semibold font-display mb-4">Edit Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                <Input {...register('companyName')} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input {...register('email')} type="email" className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <Input {...register('phoneNumber')} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Website</label>
                <Input {...register('website')} className="h-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Address</label>
              <Input {...register('address')} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea {...register('description')} rows={3} />
            </div>
            <FileUpload onFileSelect={setPhoto} label="Update Photo" preview={company.photo} />
            <Button type="submit" disabled={updateMutation.isPending} className="gradient-primary text-primary-foreground">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save Changes</>}
            </Button>
          </form>
        </motion.div>
      )}

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Deactivate Company"
        description="This will deactivate your company profile. This action may be reversible by contacting support."
        confirmLabel="Deactivate"
        onConfirm={() => deleteMutation.mutate()}
        destructive
      />
    </div>
  );
}
