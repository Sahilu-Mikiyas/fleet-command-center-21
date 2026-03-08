import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/api/auth';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string().min(6, 'At least 6 characters'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, { message: "Passwords don't match", path: ['passwordConfirm'] });

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { password: string; passwordConfirm: string }) => {
    try {
      await authApi.resetPassword(token!, data);
      setSuccess(true);
    } catch (err: any) {
      toast.error(err?.message || 'Reset failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-display mb-2">Set new password</h1>
                <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">New Password</label>
                    <Input {...register('password')} type="password" placeholder="••••••••" className="h-12" />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                    <Input {...register('passwordConfirm')} type="password" placeholder="••••••••" className="h-12" />
                    {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold font-display mb-2">Password reset!</h2>
                <p className="text-sm text-muted-foreground mb-6">You can now sign in with your new password.</p>
                <Button asChild className="gradient-primary text-primary-foreground">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
