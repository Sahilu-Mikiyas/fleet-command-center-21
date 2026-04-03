import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, Clock, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ProcessingPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If user is not an OPERATOR, they shouldn't be here
    if (user && user.role !== 'OPERATOR') {
      navigate('/dashboard');
      return;
    }

    setLoading(false);

    // Set up a polling mechanism to refresh user data periodically
    const interval = setInterval(() => {
      refreshUser();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, navigate, refreshUser]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isApproved = user.isApproved;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {isApproved ? (
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-primary animate-pulse" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-bold font-display">
              {isApproved ? 'Application Successful!' : 'Application Under Review'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {!isApproved ? (
              <>
                <div className="space-y-3">
                  <p className="text-foreground font-medium">
                    Your application is currently being processed.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This may take up to <span className="text-foreground font-semibold">48 hours</span>. 
                    Our team is reviewing your credentials to ensure the highest quality of service.
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 text-left">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    You will receive an email notification at <span className="text-foreground font-medium">{user.email}</span> once your status has been updated.
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-success font-semibold text-lg">
                    Congratulations! Your application has been approved.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Please confirm your account using the email you signed up with to proceed to your dashboard.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full gradient-primary text-white font-bold h-12"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    FleetCommand Intelligent Systems
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
