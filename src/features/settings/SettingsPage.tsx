import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, LogOut, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  password: z.string().min(6, 'At least 6 characters'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, { message: "Passwords don't match", path: ['passwordConfirm'] });

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await authApi.updatePassword(data);
      toast.success('Password updated successfully');
      reset();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <StatusBadge status={user?.status || 'ACTIVE'} className="ml-auto" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{user?.phoneNumber}</p>
          </div>
        </div>
      </motion.div>

      {/* Password Update */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold font-display">Update Password</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Current Password</label>
            <Input {...register('currentPassword')} type="password" className="h-11" />
            {errors.currentPassword && <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Password</label>
              <Input {...register('password')} type="password" className="h-11" />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm</label>
              <Input {...register('passwordConfirm')} type="password" className="h-11" />
              {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="gradient-primary text-primary-foreground">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
          </Button>
        </form>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button variant="outline" onClick={handleLogout} className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/5">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
