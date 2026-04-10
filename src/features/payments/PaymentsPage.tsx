import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paymentsApi, ChapaPaymentPayload } from '@/services/api/paymentsApi';
import { ArrowRight, CreditCard, ExternalLink } from 'lucide-react';

const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  description: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 1000,
      email: 'user@example.com',
      firstName: '',
      lastName: '',
    },
  });

  const { mutate, data, isLoading } = useMutation({
    mutationFn: (values: PaymentForm) => {
      const payload: ChapaPaymentPayload = {
        amount: values.amount,
        currency: 'ETB',
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        description: values.description || 'Fleet contribution top-up',
        callback_url: 'https://fleet-management-kzif.onrender.com/payments/chapa/callback',
      };
      return paymentsApi.initializeChapa(payload);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (values: PaymentForm) => {
    mutate(values);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8"
      >
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="text-xl">Payments</CardTitle>
          <CreditCard className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage contributions, escrow balances, and payouts. Use Chapa test credentials to simulate a payment flow.
          </p>
        </CardContent>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Chapa top-up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Amount (ETB)</Label>
              <Input type="number" step={100} {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name</Label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Last name</Label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input {...register('description')} placeholder="e.g. Monthly top-up" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Initializing…' : 'Pay with Chapa'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {data?.checkout_url && (
            <div className="mt-4 flex items-center gap-2 text-sm text-primary">
              <ExternalLink className="h-4 w-4" />
              <a className="underline" href={data.checkout_url} target="_blank" rel="noreferrer">
                Go to Chapa checkout
              </a>
            </div>
          )}
          {!data?.checkout_url && !isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              We’ll call `POST /api/payments/chapa` to generate the checkout URL using your server-side secret.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
