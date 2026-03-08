import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/shared/FileUpload';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'SHIPPER', label: 'Shipper' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'PRIVATE_TRANSPORTER', label: 'Private Transporter' },
  { value: 'BROKER', label: 'Broker' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
  passwordConfirm: z.string(),
  role: z.string().min(1, 'Role is required'),
}).refine((d) => d.password === d.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup({
        ...data,
        role: data.role as UserRole,
        photo: photo || undefined,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
    }
  };

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  return (
    <div className="flex min-h-screen">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 left-16 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-16 right-16 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl"
          />
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-4xl font-bold font-display text-primary-foreground mb-4">Join FleetCommand</h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">Start managing your fleet with the most intelligent logistics platform</p>
          </motion.div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">FleetCommand</span>
          </div>

          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground mb-6">Fill in your details to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div {...fadeUp(0.05)}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <Input {...register('fullName')} placeholder="John Doe" className="h-11" />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div {...fadeUp(0.1)}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                <Input {...register('phoneNumber')} placeholder="+1234567890" className="h-11" />
                {errors.phoneNumber && <p className="text-xs text-destructive mt-1">{errors.phoneNumber.message}</p>}
              </motion.div>
              <motion.div {...fadeUp(0.15)}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input {...register('email')} type="email" placeholder="name@email.com" className="h-11" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </motion.div>
            </div>

            <motion.div {...fadeUp(0.2)}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
              <Select onValueChange={(v) => setValue('role', v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div {...fadeUp(0.25)}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </motion.div>
              <motion.div {...fadeUp(0.3)}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm</label>
                <Input {...register('passwordConfirm')} type="password" placeholder="••••••••" className="h-11" />
                {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
              </motion.div>
            </div>

            <motion.div {...fadeUp(0.35)}>
              <FileUpload onFileSelect={setPhoto} label="Profile Photo (optional)" />
            </motion.div>

            <motion.div {...fadeUp(0.4)}>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
