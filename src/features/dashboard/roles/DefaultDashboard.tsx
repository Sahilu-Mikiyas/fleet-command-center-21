import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

export default function DefaultDashboard() {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-muted-foreground">
            Welcome to Fleet Command Center
          </p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
            <Home className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display mb-2">Welcome to Your Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Your dashboard is being personalized based on your role and preferences. 
              If you're seeing this page, your role-specific dashboard is still being configured.
            </p>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-semibold text-foreground">{user?.role || 'Not assigned'}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold font-display mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Full Name</p>
            <p className="font-semibold text-foreground">{user?.fullName || 'Not provided'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="font-semibold text-foreground">{user?.email || 'Not provided'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Role</p>
            <p className="font-semibold text-foreground">{user?.role || 'Not assigned'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="font-semibold text-foreground">{user?.status || 'Active'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
