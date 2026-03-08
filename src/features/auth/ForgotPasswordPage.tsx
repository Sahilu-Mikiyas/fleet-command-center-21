import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/api/auth';
import { toast } from 'sonner';

const schema = z.object({ email: z.string().email('Valid email required') });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-display mb-2">Forgot password?</h1>
                <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you reset instructions.</p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input {...register('email')} type="email" placeholder="name@company.com" className="h-12" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-6"
                >
                  <CheckCircle className="h-8 w-8 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold font-display mb-2">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-6">We've sent password reset instructions to your email.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
