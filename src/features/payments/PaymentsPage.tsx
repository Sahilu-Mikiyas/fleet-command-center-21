import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { paymentsApi, type PaymentInitPayload } from '@/services/api/paymentsApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  ArrowRight, CreditCard, ExternalLink, Search, Wallet,
  History, CheckCircle2, DollarSign,
} from 'lucide-react';

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive().min(100, 'Minimum 100 ETB'),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  description: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const txStatusColor: Record<string, string> = {
  SUCCESS: 'bg-emerald-500/10 text-emerald-600',
  PENDING: 'bg-amber-500/10 text-amber-600',
  FAILED: 'bg-destructive/10 text-destructive',
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [verifyRef, setVerifyRef] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const {
    register, handleSubmit, formState: { errors }, reset,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: '',
      amount: 1000,
      email: user?.email || '',
      firstName: user?.fullName?.split(' ')[0] || '',
      lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    },
  });

  const { data: transactionsData, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => paymentsApi.getTransactions(),
  });

  const transactions = transactionsData?.data?.transactions || [];

  const initMutation = useMutation({
    mutationFn: (values: PaymentForm) => {
      const payload: PaymentInitPayload = {
        orderId: values.orderId,
        amount: values.amount,
        currency: 'ETB',
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        description: values.description || 'Fleet payment',
      };
      return paymentsApi.initializePayment(payload);
    },
    onSuccess: (data) => {
      const url = data?.data?.checkout_url;
      if (url) {
        setCheckoutUrl(url);
        toast.success('Payment initialized! Redirecting to Chapa…');
      } else {
        toast.success('Payment initialized');
      }
      reset();
    },
    onError: (err: any) => toast.error(err.message || 'Payment initialization failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: (txRef: string) => paymentsApi.verifyPayment(txRef),
    onSuccess: () => {
      toast.success('Payment verified successfully');
      setVerifyRef('');
    },
    onError: (err: any) => toast.error(err.message || 'Verification failed'),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-display text-foreground">Payments</h1>
        </div>
        <p className="text-muted-foreground">
          Manage payments, verify transactions, and view payment history.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Initialize Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Initialize Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit((v) => initMutation.mutate(v))}>
              <div>
                <Label>Order ID *</Label>
                <Input {...register('orderId')} placeholder="Paste the order ID" />
                {errors.orderId && <p className="text-xs text-destructive">{errors.orderId.message}</p>}
              </div>
              <div>
                <Label>Amount (ETB) *</Label>
                <Input type="number" step={100} {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input {...register('description')} placeholder="e.g. Payment for delivery" />
              </div>
              <Button type="submit" className="w-full" disabled={initMutation.isPending}>
                {initMutation.isPending ? 'Initializing…' : 'Pay with Chapa'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {checkoutUrl && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <ExternalLink className="h-4 w-4" />
                  <a className="underline font-medium" href={checkoutUrl} target="_blank" rel="noreferrer">
                    Open Chapa Checkout
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Verify Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Transaction Reference</Label>
              <Input value={verifyRef} onChange={(e) => setVerifyRef(e.target.value)} placeholder="e.g. tx-abc123" />
            </div>
            <Button
              className="w-full"
              disabled={!verifyRef.trim() || verifyMutation.isPending}
              onClick={() => verifyMutation.mutate(verifyRef.trim())}
            >
              {verifyMutation.isPending ? 'Verifying…' : 'Verify Transaction'}
              <Search className="ml-2 h-4 w-4" />
            </Button>

            {verifyMutation.data && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-semibold text-foreground mb-1">Verification Result</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(verifyMutation.data?.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <Badge variant="secondary">{transactions.length} transactions</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTx ? (
            <p className="text-sm text-muted-foreground">Loading transactions…</p>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions found. Initialize a payment to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((tx: any) => (
                <div key={tx._id || tx.tx_ref} className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {tx.tx_ref || tx._id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.amount?.toLocaleString()} {tx.currency || 'ETB'}
                      {tx.description && ` • ${tx.description}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <Badge className={txStatusColor[tx.status?.toUpperCase()] || 'bg-muted text-muted-foreground'}>
                    {tx.status || 'Unknown'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
