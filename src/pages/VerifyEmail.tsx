import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowRight, Loader2, CheckCircle2, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';

export default function VerifyEmail() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // CRITICAL: Strip out redirect_to query parameter to prevent premature redirects
    // Supabase may append redirect_to=/tester which causes early redirect
    const url = new URL(window.location.href);
    if (url.searchParams.has('redirect_to')) {
      console.log('Removing redirect_to parameter to keep user on password setup');
      url.searchParams.delete('redirect_to');
      window.history.replaceState({}, document.title, url.toString());
    }

    // Mark that we're in email verification flow - prevents auto-redirect
    sessionStorage.setItem('inEmailVerification', 'true');

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, 'Session:', !!session);
        
        if (event === 'SIGNED_UP' && session) {
          console.log('User signed up, ready for password setup');
          setUserEmail(session.user?.email || '');
          setSessionReady(true);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('User signed in during email verification');
          setUserEmail(session.user?.email || '');
          setSessionReady(true);
        }
      }
    );

    // Check if there's already a session from the confirmation link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session fetch error:', error);
          setErrorDetails(error.message);
          setSessionError(true);
        } else if (session?.user) {
          console.log('Session found from confirmation link');
          setUserEmail(session.user.email || '');
          setSessionReady(true);
        } else {
          console.warn('No session found - verification link may have expired');
          // Check URL hash for confirmation token
          if (window.location.hash.includes('access_token') && window.location.hash.includes('type=signup')) {
            console.log('Confirmation token found in URL hash, waiting for session...');
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };

    checkSession();

    // Timeout after 15 seconds if no session is restored
    const timeout = setTimeout(() => {
      setSessionReady((prev) => {
        if (!prev) {
          console.error('Timeout: No session established after 15 seconds');
          setSessionError(true);
          setErrorDetails('Verification link may have expired. Please sign up again.');
        }
        return prev;
      });
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
      // Clean up flag when leaving verify page
      sessionStorage.removeItem('inEmailVerification');
    };
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
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
      // Update user password in Supabase
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      // Save user metadata with verification complete flag
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { email_verified: true }
      });

      if (metadataError) {
        console.error('Metadata update error:', metadataError);
      }

      setVerificationComplete(true);
      toast({ title: 'Success!', description: 'Your password has been set. Redirecting to dashboard...' });

      // Redirect to appropriate dashboard after 2 seconds
      setTimeout(() => {
        const userMetadata = (supabase.auth.getUser() as any)?.data?.user?.user_metadata;
        const role = userMetadata?.role || 'tester';
        if (role === 'recruiter') navigate('/recruiter');
        else navigate('/tester');
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      toast({ title: 'Error', description: 'Failed to set password. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email & Set Password - User Ninjas</title>
      </Helmet>
      <Background3D />
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Complete your account setup</h1>
            <p className="text-sm text-muted-foreground">Set a password to secure your account and start using User Ninjas</p>
          </div>
          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              {verificationComplete ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Account verified!</h2>
                    <p className="text-sm text-muted-foreground">Your password has been set. Redirecting to your dashboard...</p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : sessionError ? (
                <div className="text-center space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
                    <p className="text-sm text-destructive font-medium mb-1">Verification Link Error</p>
                    <p className="text-xs text-muted-foreground">
                      {errorDetails || 'The verification link has expired or is invalid. Please sign up again.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/auth?step=signup')}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-11"
                    >
                      Create New Account
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
                  <p className="text-sm text-muted-foreground">Verifying your email...</p>
                  <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{userEmail}</span> has been verified
                    </p>
                  </div>
                  <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11"
                      disabled={isLoading || !password || !confirmPassword}
                    >
                      {isLoading ? 'Setting up...' : 'Complete Account Setup'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
