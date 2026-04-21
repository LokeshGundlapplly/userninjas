import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateProfile, createUserRole } from '@/utils/profileService';
import Navbar from '@/components/Navbar';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          console.log('No session found, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        // Update user profile with provider info
        const userId = session.user.id;
        const provider = session.user.app_metadata?.provider || 'email';
        const isLinkedIn = provider === 'linkedin_oidc';
        const isGoogle = provider === 'google';
        const userEmail = session.user.email || '';
        const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

        if (isMounted) {
          // Create or update profile with all OAuth provider information
          const profileData: any = {
            full_name: userName,
            email: userEmail,
            auth_provider: provider,
            linkedin_verified: isLinkedIn,
            google_verified: isGoogle,
          };

          // For recruiter Google signups, mark as company email
          if (isGoogle) {
            profileData.company_email = true;
          }

          const profileResult = await createOrUpdateProfile(userId, profileData);

          if (!profileResult.success) {
            console.error('Error creating profile:', profileResult.error);
          }

          // Create user role if not exists
          let userRole: 'tester' | 'recruiter' | 'admin' = 'tester';
          if (isGoogle) {
            userRole = 'recruiter';
          } else if (isLinkedIn) {
            userRole = 'tester';
          }

          const roleResult = await createUserRole(userId, userRole);
          if (!roleResult.success) {
            console.error('Error creating role:', roleResult.error);
          }

          toast({
            title: "Sign in successful",
            description: `Welcome back! You signed in with ${provider}.`,
          });

          // Redirect based on role
          if (role === 'recruiter' || (isGoogle && !role)) {
            navigate('/recruiter', { replace: true });
          } else if (role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/tester', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error?.message || 'Failed to complete sign-in. Please try again.',
          });
          navigate('/auth', { replace: true });
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, role, toast]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Completing your sign-in...</p>
        </div>
      </main>
    </>
  );
}
