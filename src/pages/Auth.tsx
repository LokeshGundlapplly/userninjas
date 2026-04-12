import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Users, Briefcase, Mail, Lock, User, ArrowRight, RotateCw, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type UserRole = 'tester' | 'recruiter';
type AuthStep = 'form' | 'confirm' | 'forgot' | 'otp';
type OtpMethod = 'edge' | 'supabase';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<AuthStep>('form');
  const [selectedRole, setSelectedRole] = useState<UserRole>('tester');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [otpCode, setOtpCode] = useState('');
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [otpMethod, setOtpMethod] = useState<OtpMethod>('edge');


  const { user, role, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users (blocked during OTP verification)
  useEffect(() => {
    if (step === 'otp') return;
    if (user && role) {
      if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'tester') navigate('/tester', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, role, navigate, step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // OTP resend cooldown timer
  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const t = setTimeout(() => setOtpResendCooldown(otpResendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendCooldown]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (isSignUp) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Forgot Password ───
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a password reset link.' });
        setStep('form');
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Sign In / Sign Up ───
  const sendOtpCode = async (targetEmail: string): Promise<OtpMethod> => {
    const normalizedEmail = targetEmail.trim().toLowerCase();

    // Primary path: Supabase built-in OTP (most reliable across environments)
    const { error: supabaseOtpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (!supabaseOtpError) {
      return 'supabase';
    }

    // Fallback path: custom edge OTP for projects using login_otps flow
    try {
      const { data: otpData, error: otpError } = await supabase.functions.invoke('send-login-otp', {
        body: { email: normalizedEmail },
      });
      if (otpError) throw otpError;
      if (otpData?.error) throw new Error(otpData.error);
      return 'edge';
    } catch (edgeErr: any) {
      throw new Error(
        supabaseOtpError.message || edgeErr?.message || 'Unable to send verification code right now.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error, data } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          const msg = error.message || 'An unexpected error occurred';
          const isExisting = msg.includes('already registered') || msg.includes('already been registered');
          toast({
            title: isExisting ? 'Account exists' : 'Sign up failed',
            description: isExisting
              ? 'This email is already registered. Please sign in instead.'
              : msg,
            variant: 'destructive',
          });
          return;
        }

        // Supabase returns a user with empty identities when email is already confirmed
        const identities = data?.user?.identities ?? [];
        if (data?.user && identities.length === 0) {
          toast({
            title: 'Account exists',
            description: 'This email is already registered. Please sign in instead.',
            variant: 'destructive',
          });
          setIsSignUp(false);
          return;
        }

        toast({
          title: 'Account created',
          description: data?.session 
            ? 'Redirecting to your dashboard...'
            : 'Check your email for a confirmation link to activate your account.',
        });
        
        // If autoconfirm is enabled, session exists immediately → redirect will happen via onAuthStateChange
        // If email confirmation is required, show the confirm step
        if (!data?.session) {
          setStep('confirm');
        }
        setPassword('');
        setFullName('');
      } else {
        // Step 1: Verify password credentials
        const { error } = await signIn(email, password);
        if (error) {
          const msg = error.message || 'An unexpected error occurred';
          toast({ title: 'Sign in failed', description: msg, variant: 'destructive' });
          return;
        }

        // Step 2: Immediately sign out to prevent redirect race condition.
        // The session will be re-created after successful OTP verification.
        await supabase.auth.signOut();

        // Step 3: Send OTP for second-factor verification
        try {
          const method = await sendOtpCode(email);

          setOtpMethod(method);
          setStep('otp');
          setOtpResendCooldown(60);
          toast({
            title: 'Verification code sent',
            description: method === 'edge'
              ? 'Check your email for the 6-digit code.'
              : 'Check your email for the Supabase verification code.',
          });
        } catch (otpErr: any) {
          toast({
            title: 'Could not send verification code',
            description: otpErr?.message || 'Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      setResendCooldown(60);
      toast({
        title: 'Email sent',
        description: `Check ${email} for the confirmation link`,
      });
    } catch {
      toast({ title: 'Failed to resend', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Verification ───
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast({ title: 'Invalid code', description: 'Please enter the 6-digit code.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (otpMethod === 'edge') {
        const { data, error } = await supabase.functions.invoke('verify-login-otp', {
          body: { email, otp: otpCode },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // OTP verified — re-sign-in to create session (was signed out after password check)
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw new Error(signInError.message || 'Failed to complete sign in');
      } else {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email',
        });
        if (verifyError) throw verifyError;
      }

      toast({ title: 'Verified!', description: 'Redirecting to your dashboard...' });

      // Fetch role and navigate directly
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession?.user) {
        const { data: roleRows } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', activeSession.user.id);
        const roles = (roleRows || []).map((r: any) => r.role as string);
        const userRole = roles.includes('admin') ? 'admin' : roles[0];
        if (userRole === 'recruiter') navigate('/recruiter', { replace: true });
        else if (userRole === 'tester') navigate('/tester', { replace: true });
        else if (userRole === 'admin') navigate('/admin', { replace: true });
        else navigate('/', { replace: true });
      } else {
        setStep('form'); // fallback to useEffect
      }
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.message || 'Invalid or expired code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return;
    setIsLoading(true);
    try {
      const method = await sendOtpCode(email);
      setOtpMethod(method);

      setOtpResendCooldown(60);
      setOtpCode('');
      toast({
        title: 'New code sent',
        description: `Check ${email} for the fresh verification code.`,
      });
    } catch (err: any) {
      toast({ title: 'Failed to resend', description: err?.message || 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOtp = async () => {
    // User was already signed out after password verification
    setStep('form');
    setOtpCode('');
    toast({ title: 'Sign in cancelled', description: 'Please sign in again to continue.' });
  };

  const pageTitle = step === 'forgot' ? 'Reset your password'
    : step === 'confirm' ? 'Confirm your email'
    : step === 'otp' ? 'Verify your identity'
    : isSignUp ? 'Create your account' : 'Welcome back';

  const pageSubtitle = step === 'forgot' ? "Enter your email and we'll send you a reset link"
    : step === 'confirm' ? `Use the link we sent to ${email} to activate your account`
    : step === 'otp' ? `Enter the 6-digit code sent to ${email}`
    : isSignUp ? 'Join User Ninjas as a tester or recruiter' : 'Sign in to continue to your dashboard';

  return (
    <>
      <Helmet>
        <title>{pageTitle} - User Ninjas</title>
        <meta name="description" content="Sign in or create an account to access User Ninjas platform." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">

              {/* ─── FORGOT PASSWORD ─── */}
              {step === 'forgot' && (
                <>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                  <div className="mt-6 text-center">
                    <button type="button" onClick={() => { setStep('form'); setErrors({}); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Back to sign in
                    </button>
                  </div>
                </>
              )}

              {/* ─── EMAIL CONFIRMATION ─── */}
              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground text-center leading-6">
                    We've sent a confirmation email to <strong className="text-foreground">{email}</strong>. Open the message and click the activation link to verify your account before signing in.
                  </div>

                  <Button onClick={() => setStep('form')} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading}>
                    Back to sign in
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                    </button>
                    <br />
                    <button type="button" onClick={() => { setStep('form'); setIsSignUp(false); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      ← Back to sign in
                    </button>
                  </div>
                </div>
              )}

              {/* ─── OTP VERIFICATION ─── */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground text-center leading-6">
                    We've sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>. Enter it below to complete your sign-in.
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otpCode" className="text-sm">Verification Code</Label>
                      <Input
                        id="otpCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                        autoFocus
                        autoComplete="one-time-code"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11"
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendCooldown > 0 || isLoading}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {otpResendCooldown > 0 ? `Resend code in ${otpResendCooldown}s` : 'Resend code'}
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={handleCancelOtp}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      ← Cancel sign in
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SIGN IN / SIGN UP FORM ─── */}
              {step === 'form' && (
                <>
                  {isSignUp && (
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-3 block">I want to join as:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { role: 'tester' as UserRole, icon: Users, label: 'Tester', desc: 'Earn money testing apps' },
                          { role: 'recruiter' as UserRole, icon: Briefcase, label: 'Recruiter', desc: 'Find testers for products' },
                        ]).map(({ role, icon: Icon, label, desc }) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedRole === role 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border/60 hover:border-border'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-2 ${selectedRole === role ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="font-semibold text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="fullName" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                        </div>
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        {!isSignUp && (
                          <button type="button" onClick={() => { setStep('forgot'); setErrors({}); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    
                    <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading}>
                      {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
