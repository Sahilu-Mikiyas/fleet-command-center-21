import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contractApi } from '@/services/api/contractApi';
import type { Contract } from '@/types';

const viewOptions: Array<'vendor' | 'company'> = ['vendor', 'company'];

function ContractRow({ contract, dense = false }: { contract: Contract; dense?: boolean }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${dense ? 'text-xs' : ''}`}>
      <p className="font-semibold">{contract._id}</p>
      <p>{contract.status}</p>
      <p>{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : '—'}</p>
    </div>
  );
}

export default function ContractsPage() {
  const [view, setView] = useState<'vendor' | 'company'>('vendor');
  const { data: vendorResponse, isLoading: loadingVendor, refetch: refetchVendor } = useQuery({
    queryKey: ['contracts', 'vendor'],
    queryFn: () => contractApi.getVendorContracts(),
  });
  const { data: companyResponse, isLoading: loadingCompany, refetch: refetchCompany } = useQuery({
    queryKey: ['contracts', 'company'],
    queryFn: () => contractApi.getCompanyContracts()
  });
  const approveMutation = useMutation({
    mutationFn: (id: string) => contractApi.approveContract(id),
    onSuccess: () => {
      refetchVendor();
      refetchCompany();
    },
  });
  const terminateMutation = useMutation({
    mutationFn: (id: string) => contractApi.terminateContract(id),
    onSuccess: () => {
      refetchVendor();
      refetchCompany();
    },
  });

  const activeContracts = useMemo(() => (view === 'vendor' ? vendorResponse?.data?.contracts : companyResponse?.data?.contracts) || [], [view, vendorResponse, companyResponse]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl">Contracts</CardTitle>
          <div className="flex gap-2">
            {viewOptions.map((option) => (
              <Button key={option} variant={view === option ? 'default' : 'ghost'} size="sm" onClick={() => setView(option)}>
                {option === 'vendor' ? 'Vendor view' : 'Company view'}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {(view === 'vendor' ? loadingVendor : loadingCompany) ? (
            <p className="text-sm text-muted-foreground">Loading contracts…</p>
          ) : activeContracts.length ? (
            <div className="space-y-4">
              {activeContracts.map((contract) => (
                <Card key={contract._id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Contract ID: {contract._id}</p>
                      <p className="text-xs text-muted-foreground">Status: {contract.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={contract.status !== 'PENDING'} onClick={() => approveMutation.mutate(contract._id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => terminateMutation.mutate(contract._id)}>
                        Terminate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No contracts available.</p>
          )}
        </CardContent>
      </motion.div>
    </div>
  );
}
