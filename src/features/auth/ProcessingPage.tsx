import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ProcessingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!isAuthenticated || !user?.id) {
        navigate('/login');
        return;
      }

      // Assuming 'operator' is the role that requires approval
      // This logic might need to be refined based on actual backend implementation
      if (user.role === 'OPERATOR') { // Assuming user.role is available from AuthContext
        const { data, error } = await supabase
          .from('operators') // Assuming a table 'operators' stores approval status
          .select('is_approved')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching operator approval status:', error);
          setApprovalStatus('unknown');
        } else if (data?.is_approved === true) {
          setApprovalStatus('approved');
        } else if (data?.is_approved === false) {
          setApprovalStatus('rejected'); // Assuming a 'false' status means rejected
        } else {
          setApprovalStatus('pending');
        }
      } else {
        // For other roles, they are considered approved by default or redirected immediately
        setApprovalStatus('approved');
      }
      setLoading(false);
    };

    checkApprovalStatus();

    // Set up a polling mechanism to check status periodically if pending
    const interval = setInterval(() => {
      if (approvalStatus === 'pending') {
        checkApprovalStatus();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, navigate, approvalStatus]);

  useEffect(() => {
    if (!loading) {
      if (approvalStatus === 'approved') {
        // Redirect to the appropriate dashboard based on user.role
        // This logic will be further refined in a later phase
        navigate('/dashboard'); 
      } else if (approvalStatus === 'rejected') {
        // Maybe a specific rejected page or message
      }
    }
  }, [loading, approvalStatus, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Checking your application status...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {approvalStatus === 'pending' && 'Application Under Review'}
            {approvalStatus === 'approved' && 'Application Successful!'}
            {approvalStatus === 'rejected' && 'Application Status'}
            {approvalStatus === 'unknown' && 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvalStatus === 'pending' && (
            <>
              <p className="text-muted-foreground">Your application is currently being processed. This may take up to 48 hours.</p>
              <p className="text-muted-foreground">You will receive an email notification once your status has been updated.</p>
              <p className="text-muted-foreground">Please check back later.</p>
            </>
          )}
          {approvalStatus === 'approved' && (
            <>
              <p className="text-green-500 font-semibold">Congratulations! Your application has been successfully approved.</p>
              <p className="text-muted-foreground">Please confirm your account using the email you signed up with to proceed to your dashboard.</p>
              <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">Go to Dashboard</button>
            </>
          )}
          {approvalStatus === 'rejected' && (
            <>
              <p className="text-red-500 font-semibold">Unfortunately, your application could not be approved at this time.</p>
              <p className="text-muted-foreground">Please contact support for more information or to appeal this decision.</p>
            </>
          )}
          {approvalStatus === 'unknown' && (
            <>
              <p className="text-red-500 font-semibold">An unexpected error occurred while checking your application status.</p>
              <p className="text-muted-foreground">Please try again later or contact support.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
