import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary"
          >
            <Truck className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If user is an OPERATOR and not yet approved, redirect to processing page
  if (userRole === 'OPERATOR' && user && !user.isApproved) { // Assuming user.isApproved will be added to User type
    return <Navigate to="/processing" replace />;
  }
  return <>{children}</>;
}
