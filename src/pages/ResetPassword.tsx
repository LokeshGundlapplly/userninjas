import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL for recovery token - be more flexible with checking
    const hash = window.location.hash;
    const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('access_token');
    
    if (isRecoveryFlow) {
      console.log('✓ Recovery token detected in URL');
      setIsRecoveryMode(true);
    }

    let sessionCheckAttempts = 0;
    let sessionReady = false;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Has session:', !!session);
        
        if (session && (isRecoveryFlow || event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED')) {
          console.log('✓ Recovery session established via:', event);
          setSessionReady(true);
          setIsRecoveryMode(true);
          sessionReady = true;
        }
      }
    );

    // Check for session from recovery link with retries
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          // Don't set error immediately, wait for timeout
          return;
        }

        if (session) {
          console.log('✓ Session found for recovery');
          setSessionReady(true);
          setIsRecoveryMode(true);
          sessionReady = true;
          return;
        }

        if (isRecoveryFlow) {
          console.log('Recovery token in URL, waiting for Supabase to establish session...');
          // Retry after a short delay
          sessionCheckAttempts++;
          if (sessionCheckAttempts < 3) {
            setTimeout(checkRecoverySession, 800);
          }
        }
      } catch (err) {
        console.error('Error checking recovery session:', err);
        // Don't set error immediately, wait for timeout
      }
    };

    checkRecoverySession();

    // Extended timeout after 30 seconds (was 20s) - give more time for recovery
    const timeout = setTimeout(() => {
      if (!sessionReady && isRecoveryFlow) {
        console.error('⏱ Recovery session timeout after 30s');
        setSessionError(true);
        setErrorDetails('Recovery link may have expired. Please request a new password reset.');
      }
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Password update error:', error);
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        console.log('✓ Password updated successfully');
        toast({ 
          title: 'Password updated!', 
          description: 'Your password has been successfully changed. Signing out and redirecting to login...' 
        });
        
        // Wait a moment for the toast to display
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sign out the user
        console.log('Signing out...');
        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
          console.error('Sign out error:', signOutError);
        } else {
          console.log('✓ Signed out successfully');
        }
        
        // Redirect to auth page
        navigate('/auth', { replace: true });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - User Ninjas</title>
      </Helmet>
      <Background3D />
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Set new password</h1>
            <p className="text-sm text-muted-foreground">Enter your new password below.</p>
          </div>
          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              {sessionError ? (
                <div className="text-center space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
                    <p className="text-sm text-destructive font-medium mb-1">Reset Link Error</p>
                    <p className="text-xs text-muted-foreground">
                      {errorDetails || 'The reset link has expired or is invalid. Please request a new one.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/auth?step=forgot')}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-11"
                    >
                      Request New Reset Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/auth')}
                      className="w-full rounded-xl h-11"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : !sessionReady ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
                  <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
