import { useState, useEffect, useRef } from 'react';
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
import { Users, Briefcase, Mail, Lock, User, ArrowRight, ShieldCheck, RotateCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type UserRole = 'tester' | 'recruiter';
type AuthStep = 'form' | 'otp' | 'forgot';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<AuthStep>('form');
  const [selectedRole, setSelectedRole] = useState<UserRole>('tester');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users
  useEffect(() => {
    if (user && role) {
      if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'tester') navigate('/tester', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, role, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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

  // ─── Send OTP via our edge function ───
  const sendOtp = async (targetEmail: string, name: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('un_otp', code);
    sessionStorage.setItem('un_otp_ts', Date.now().toString());
    await supabase.functions.invoke('send-email', {
      body: { type: 'otp', to: targetEmail, data: { name, otp: code } },
    });
  };

  // ─── Verify OTP ───
  const verifyOtp = (entered: string): boolean => {
    const stored = sessionStorage.getItem('un_otp');
    const ts = parseInt(sessionStorage.getItem('un_otp_ts') || '0', 10);
    if (!stored || Date.now() - ts > 10 * 60 * 1000) return false; // 10 min expiry
    return entered === stored;
  };

  const clearOtpStorage = () => {
    sessionStorage.removeItem('un_otp');
    sessionStorage.removeItem('un_otp_ts');
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

  // ─── Step 1: Submit email + password → send OTP ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Create account (Supabase will NOT auto-confirm since we handle OTP ourselves)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, role: selectedRole },
          },
        });
        if (error) {
          toast({
            title: error.message.includes('already registered') ? 'Account exists' : 'Sign up failed',
            description: error.message.includes('already registered')
              ? 'This email is already registered. Please sign in instead.'
              : error.message,
            variant: 'destructive',
          });
          return;
        }
        // Send OTP while still authenticated, then sign out
        await sendOtp(email, fullName || email.split('@')[0]);
        await supabase.auth.signOut();
      } else {
        // Verify password first
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: 'Sign in failed', description: 'Invalid email or password.', variant: 'destructive' });
          return;
        }
        // Send OTP while still authenticated, then sign out
        await sendOtp(email, email.split('@')[0]);
        await supabase.auth.signOut();
      }
      // Move to OTP step
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setResendCooldown(60);
      toast({ title: 'OTP sent ✉️', description: `We sent a 6-digit code to ${email}` });
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP → final sign in ───
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast({ title: 'Enter all 6 digits', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (!verifyOtp(code)) {
        toast({ title: 'Invalid or expired code', description: 'Please check the code or request a new one.', variant: 'destructive' });
        return;
      }
      clearOtpStorage();
      // OTP verified — now sign in for real
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Verified! 🎉', description: 'Welcome to User Ninjas!' });
      // Redirect is handled by the useEffect above
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ───
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await sendOtp(email, fullName || email.split('@')[0]);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      toast({ title: 'New code sent ✉️', description: `Check ${email} for the new code.` });
    } catch {
      toast({ title: 'Failed to resend', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Input Handlers ───
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const pageTitle = step === 'forgot' ? 'Reset your password'
    : step === 'otp' ? 'Verify your email'
    : isSignUp ? 'Create your account' : 'Welcome back';

  const pageSubtitle = step === 'forgot' ? "Enter your email and we'll send you a reset link"
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

              {/* ─── OTP VERIFICATION ─── */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border/60 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <Button onClick={handleVerifyOtp} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading || otp.join('').length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                    <br />
                    <button type="button" onClick={() => { setStep('form'); clearOtpStorage(); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      ← Back to {isSignUp ? 'sign up' : 'sign in'}
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
