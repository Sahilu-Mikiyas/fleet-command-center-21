import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, ExternalLink, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ordersApi } from '@/services/api/ordersApi';
import { paymentsApi } from '@/services/api/paymentsApi';

export default function PublicPaymentPage() {
  const [orderId, setOrderId] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [payment, setPayment] = useState({
    amount: 1000,
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const fetchOrderMutation = useMutation({
    mutationFn: (id: string) => ordersApi.getOrderPublicStatus(id),
    onError: (err: any) => toast.error(err?.message || 'Order not found'),
  });

  const payMutation = useMutation({
    mutationFn: () =>
      paymentsApi.initializePublicPayment({
        orderId: orderId.trim(),
        amount: Number(payment.amount),
        currency: 'ETB',
        email: payment.email || undefined,
        first_name: payment.firstName || undefined,
        last_name: payment.lastName || undefined,
        phone_number: payment.phoneNumber || undefined,
        description: `Public order payment (${orderId.trim()})`,
      }),
    onSuccess: (res) => {
      const url = (res as any)?.data?.checkout_url;
      if (url) {
        setCheckoutUrl(url);
        toast.success('Payment initialized. Continue to checkout.');
      } else {
        toast.success('Payment initialized');
      }
    },
    onError: (err: any) => toast.error(err?.message || 'Payment initialization failed'),
  });

  const order = (fetchOrderMutation.data as any)?.data?.order || (fetchOrderMutation.data as any)?.order || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Pay for an Order</h1>
            <p className="text-sm text-muted-foreground mt-1">No sign-in required. Enter an order ID, confirm status, then proceed to payment.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back Home
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> 1) Check order status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Order ID</Label>
                <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Paste order id here" />
              </div>
              <Button
                className="w-full"
                disabled={!orderId.trim() || fetchOrderMutation.isPending}
                onClick={() => fetchOrderMutation.mutate(orderId.trim())}
              >
                {fetchOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Order'}
              </Button>

              {order && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1">
                  <p className="font-semibold">{order.title || order._id || orderId}</p>
                  <p className="text-muted-foreground">
                    {order.pickupLocation?.city ?? '—'} → {order.deliveryLocation?.city ?? '—'}
                  </p>
                  <Badge className="mt-1">{order.status || 'UNKNOWN'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggested amount: {order.pricing?.currency || 'ETB'} {order.pricing?.proposedBudget?.toLocaleString?.() || '—'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> 2) Pay now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Amount (ETB)</Label>
                <Input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => setPayment((p) => ({ ...p, amount: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First name</Label>
                  <Input value={payment.firstName} onChange={(e) => setPayment((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input value={payment.lastName} onChange={(e) => setPayment((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={payment.email} onChange={(e) => setPayment((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone number</Label>
                  <Input value={payment.phoneNumber} onChange={(e) => setPayment((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="+2519..." />
                </div>
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground"
                disabled={!orderId.trim() || !payment.amount || payMutation.isPending}
                onClick={() => payMutation.mutate()}
              >
                {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Initialize Payment'}
              </Button>

              {checkoutUrl && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <a href={checkoutUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary font-medium hover:underline">
                    Continue to secure checkout <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
