import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ordersApi } from '@/services/api/ordersApi';
import type { MarketplaceOrderCreatePayload, Order } from '@/types';

const formSchema = z.object({
  title: z.string().min(3),
  pickupAddress: z.string().min(3),
  pickupCity: z.string().min(2),
  deliveryAddress: z.string().min(3),
  deliveryCity: z.string().min(2),
  pickupDate: z.string(),
  budget: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OrdersPage() {
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      pickupAddress: '',
      pickupCity: '',
      deliveryAddress: '',
      deliveryCity: '',
      pickupDate: '',
      budget: 0,
    },
  });

  const { data: marketplaceResponse, isLoading: loadingMarketplace, refetch } = useQuery({
    queryKey: ['orders', 'marketplace'],
    queryFn: () => ordersApi.getMarketplaceOrders(),
  });

  const { data: myOrdersResponse, isLoading: loadingMine } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.getMyOrders(),
  });

  const createOrder = useMutation({
    mutationFn: (payload: MarketplaceOrderCreatePayload) => ordersApi.createMarketplaceOrder(payload),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  const marketplaceOrders: Order[] = marketplaceResponse?.data?.orders || [];
  const myOrders: Order[] = myOrdersResponse?.data?.orders || [];

  const onSubmit = (values: FormValues) => {
    const payload: MarketplaceOrderCreatePayload = {
      assignmentMode: 'OPEN_MARKETPLACE',
      title: values.title,
      pickupLocation: {
        address: values.pickupAddress,
        city: values.pickupCity,
        country: 'Ethiopia',
      },
      deliveryLocation: {
        address: values.deliveryAddress,
        city: values.deliveryCity,
        country: 'Ethiopia',
      },
      pickupDate: values.pickupDate,
      proposedBudget: values.budget,
      currency: 'ETB',
    };
    createOrder.mutate(payload);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8"
      >
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">Marketplace Orders</CardTitle>
          <p className="text-sm text-muted-foreground">Live orders for shippers and transporters</p>
        </CardHeader>
        <CardContent>
          {loadingMarketplace ? (
            <p className="text-sm text-muted-foreground">Loading marketplace orders…</p>
          ) : ( 
            <div className="grid gap-4 md:grid-cols-2">
              {marketplaceOrders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-border bg-muted/70 p-4">
                  <p className="text-base font-semibold text-foreground">{order.title || order._id}</p>
                  <p className="text-xs text-muted-foreground">Status: {order.status || 'OPEN'}</p>
                  <p className="text-xs text-muted-foreground">
                    Pickup: {order.pickupLocation?.city ?? '—'} • Delivery: {order.deliveryLocation?.city ?? '—'}
                  </p>
                </div>
              ))}
              {!marketplaceOrders.length && <p className="text-sm text-muted-foreground">No marketplace orders yet.</p>}
            </div>
          )}
        </CardContent>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMine ? (
              <p className="text-sm text-muted-foreground">Loading your orders…</p>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div key={order._id} className="rounded-lg border border-border p-3">
                    <p className="font-semibold">{order.title || order._id}</p>
                    <p className="text-xs text-muted-foreground">Status: {order.status}</p>
                  </div>
                ))}
                {!myOrders.length && <p className="text-sm text-muted-foreground">You haven’t created orders yet.</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create marketplace order</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label>Title</Label>
                <Input {...register('title')} placeholder="e.g. Addis to Awash Delivery" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div>
                <Label>Pickup Address</Label>
                <Input {...register('pickupAddress')} placeholder="Bole Road Warehouse" />
                {errors.pickupAddress && <p className="text-xs text-destructive">{errors.pickupAddress.message}</p>}
              </div>
              <div>
                <Label>Pickup City</Label>
                <Input {...register('pickupCity')} placeholder="Addis Ababa" />
                {errors.pickupCity && <p className="text-xs text-destructive">{errors.pickupCity.message}</p>}
              </div>
              <div>
                <Label>Delivery Address</Label>
                <Input {...register('deliveryAddress')} placeholder="Adama Distribution Hub" />
                {errors.deliveryAddress && <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>}
              </div>
              <div>
                <Label>Delivery City</Label>
                <Input {...register('deliveryCity')} placeholder="Adama" />
                {errors.deliveryCity && <p className="text-xs text-destructive">{errors.deliveryCity.message}</p>}
              </div>
              <div>
                <Label>Pickup Date</Label>
                <Input type="datetime-local" {...register('pickupDate')} />
                {errors.pickupDate && <p className="text-xs text-destructive">{errors.pickupDate.message}</p>}
              </div>
              <div>
                <Label>Proposed Budget (ETB)</Label>
                <Controller
                  control={control}
                  name="budget"
                  render={({ field }) => (
                    <Input type="number" min={0} {...field} />
                  )}
                />
                {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createOrder.isLoading || isSubmitting}>
                {createOrder.isLoading || isSubmitting ? 'Submitting…' : 'Create Order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
