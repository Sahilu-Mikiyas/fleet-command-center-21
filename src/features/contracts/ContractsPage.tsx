import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { contractApi } from '@/services/api/contractApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FileText, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Contract } from '@/types';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  APPROVED: 'bg-emerald-500/10 text-emerald-600',
  TERMINATED: 'bg-destructive/10 text-destructive',
};

export default function ContractsPage() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'vendor' | 'company'>('company');
  const [showInitiate, setShowInitiate] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { vendorId: '', companyId: '', terms: '', notes: '' },
  });

  const { data: vendorResponse, isLoading: loadingVendor } = useQuery({
    queryKey: ['contracts', 'vendor'],
    queryFn: () => contractApi.getVendorContracts(),
  });
  const { data: companyResponse, isLoading: loadingCompany } = useQuery({
    queryKey: ['contracts', 'company'],
    queryFn: () => contractApi.getCompanyContracts(),
  });

  const initiateMutation = useMutation({
    mutationFn: (data: any) => contractApi.initiateContract(data),
    onSuccess: () => {
      toast.success('Contract initiated!');
      setShowInitiate(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to initiate'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => contractApi.approveContract(id),
    onSuccess: () => {
      toast.success('Contract approved');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Approval failed'),
  });

  const terminateMutation = useMutation({
    mutationFn: (id: string) => contractApi.terminateContract(id),
    onSuccess: () => {
      toast.success('Contract terminated');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Termination failed'),
  });

  const contracts: Contract[] = (view === 'vendor'
    ? vendorResponse?.data?.contracts
    : companyResponse?.data?.contracts) || [];
  const isLoading = view === 'vendor' ? loadingVendor : loadingCompany;

  const canInitiate = ['VENDOR', 'SHIPPER', 'COMPANY_ADMIN', 'OPERATOR'].includes(userRole ?? '');
  const canApprove = ['COMPANY_ADMIN', 'OPERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole ?? '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Contracts</h1>
              <p className="text-sm text-muted-foreground">Manage partnerships and contract agreements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={view === 'vendor' ? 'default' : 'outline'} size="sm" onClick={() => setView('vendor')}>
              Vendor View
            </Button>
            <Button variant={view === 'company' ? 'default' : 'outline'} size="sm" onClick={() => setView('company')}>
              Company View
            </Button>
            {canInitiate && (
              <Button size="sm" onClick={() => setShowInitiate(true)}>
                <Plus className="h-4 w-4 mr-1" /> Initiate Contract
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: contracts.length, icon: FileText },
          { label: 'Pending', value: contracts.filter(c => c.status === 'PENDING').length, icon: Clock },
          { label: 'Active', value: contracts.filter(c => c.status === 'ACTIVE' || c.status === 'APPROVED').length, icon: CheckCircle2 },
          { label: 'Terminated', value: contracts.filter(c => c.status === 'TERMINATED').length, icon: XCircle },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>{view === 'vendor' ? 'Vendor Contracts' : 'Company Contracts'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading contracts…</p>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No contracts found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(contract => (
                <div key={contract._id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">Contract: {contract._id}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        {contract.vendorId && <span>Vendor: {contract.vendorId}</span>}
                        {contract.companyId && <span>Company: {contract.companyId}</span>}
                        {contract.createdAt && <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={statusColor[contract.status] || 'bg-muted text-muted-foreground'}>
                        {contract.status}
                      </Badge>
                      {canApprove && contract.status === 'PENDING' && (
                        <Button size="sm" disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(contract._id)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-destructive" disabled={contract.status === 'TERMINATED' || terminateMutation.isPending} onClick={() => terminateMutation.mutate(contract._id)}>
                        Terminate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initiate Contract Dialog */}
      <Dialog open={showInitiate} onOpenChange={setShowInitiate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Initiate Partnership Contract</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((data) => initiateMutation.mutate(data))} className="space-y-4">
            <div>
              <Label>Vendor ID</Label>
              <Input {...register('vendorId')} placeholder="Vendor user ID" />
            </div>
            <div>
              <Label>Company ID</Label>
              <Input {...register('companyId')} placeholder="Target company ID" />
            </div>
            <div>
              <Label>Terms</Label>
              <Textarea {...register('terms')} placeholder="Contract terms and conditions…" rows={3} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea {...register('notes')} placeholder="Additional notes…" rows={2} />
            </div>
            <Button type="submit" className="w-full" disabled={initiateMutation.isPending}>
              {initiateMutation.isPending ? 'Initiating…' : 'Initiate Contract'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
