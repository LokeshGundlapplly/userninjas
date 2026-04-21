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
import { Users, Briefcase, Mail, Lock, User, ArrowRight, RotateCw, ShieldCheck, Linkedin, Chrome } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import { isValidCompanyEmail } from '@/utils/emailValidation';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type UserRole = 'tester' | 'recruiter';
type AuthStep = 'form' | 'confirm' | 'forgot' | 'otp';
type OtpMethod = 'supabase';

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
  const [otpVerifyAttemptCooldown, setOtpVerifyAttemptCooldown] = useState(0);
  const [otpMethod, setOtpMethod] = useState<OtpMethod>('supabase');
  const [otpChallengePending, setOtpChallengePending] = useState(false);
  const [storedPassword, setStoredPassword] = useState(''); // Keep password for sign in
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0); // Track consecutive failed attempts
  const [resendAttemptCount, setResendAttemptCount] = useState(0); // Track consecutive resend attempts


  const { user, role, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get proper redirect URL for auth flows
  const getRedirectUrl = (path: string) => {
    // Use environment domain if available (production), otherwise use current origin
    const appDomain = import.meta.env.VITE_APP_DOMAIN || window.location.origin;
    return `${appDomain}${path}`;
  };

  // Handle URL query parameters (email link from OTP email + step navigation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    const urlCode = params.get('code');
    const urlStep = params.get('step');
    
    if (urlStep === 'forgot') {
      setStep('forgot');
    } else if (urlEmail && urlCode) {
      // Pre-fill OTP verification form
      setEmail(decodeURIComponent(urlEmail));
      setOtpCode(urlCode);
      setStep('otp');
    }
    
    // Clean up URL bar
    window.history.replaceState({}, document.title, '/auth');
  }, []);

  // Redirect authenticated users (blocked during OTP verification)
  useEffect(() => {
    if (step === 'otp' || otpChallengePending) return;
    if (user && role) {
      // Add small delay to ensure role is properly set in database
      const timer = setTimeout(() => {
        if (role === 'recruiter') navigate('/recruiter', { replace: true });
        else if (role === 'tester') navigate('/tester', { replace: true });
        else if (role === 'admin') navigate('/admin', { replace: true });
        else navigate('/', { replace: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, role, navigate, step, otpChallengePending]);

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

  // OTP verification attempt cooldown timer (rate limit protection)
  useEffect(() => {
    if (otpVerifyAttemptCooldown <= 0) return;
    const t = setTimeout(() => setOtpVerifyAttemptCooldown(otpVerifyAttemptCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [otpVerifyAttemptCooldown]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    
    // For recruiter signup, validate company email
    if (isSignUp && selectedRole === 'recruiter' && emailResult.success) {
      if (!isValidCompanyEmail(email)) {
        newErrors.email = 'Please use a company email address (not a personal email like Yahoo, Hotmail, etc.)';
      }
    }
    
    if (!isSignUp) {
      // Only validate password for sign in
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    }
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
        redirectTo: getRedirectUrl('/reset-password'),
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ 
          title: 'Check your email', 
          description: 'We sent you a password reset link. Click it to set a new password.' 
        });
        setStep('form');
        setEmail('');
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Sign In / Sign Up ───
  const getOtpHelpMessage = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('otp_disabled') || msg.includes('otp is disabled')) {
      return 'Email OTP is disabled in Supabase. Enable it in Authentication > Providers > Email, or deploy the send-login-otp edge function.';
    }
    if (msg.includes('failed to send a request to the edge function') || msg.includes('404')) {
      return 'OTP edge function is not deployed in this Supabase project. Please deploy send-login-otp and verify-login-otp.';
    }
    return message;
  };

  const getReadableError = (err: unknown, fallback: string) => {
    if (!err) return fallback;

    if (typeof err === 'string') {
      const msg = err.trim();
      return msg.length > 0 && msg !== '{}' ? msg : fallback;
    }

    if (typeof err === 'object') {
      const anyErr = err as any;
      const direct = typeof anyErr?.message === 'string' ? anyErr.message.trim() : '';
      if (direct && direct !== '{}') return direct;

      const nested = typeof anyErr?.error_description === 'string'
        ? anyErr.error_description.trim()
        : typeof anyErr?.error === 'string'
          ? anyErr.error.trim()
          : '';
      if (nested && nested !== '{}') return nested;
    }

    return fallback;
  };

  // Generate secure temporary password that meets Supabase requirements
  const generateSecureTempPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+=-[]{};";<>?,.\'/~';
    
    // Pick one character from each required set
    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest with random characters from all sets
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = password.length; i < 16; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const sendOtpCode = async (targetEmail: string): Promise<OtpMethod> => {
    const normalizedEmail = targetEmail.trim().toLowerCase();

    console.log(`📧 Attempting to send OTP to: ${normalizedEmail}`);

    // Use ONLY Supabase built-in OTP (most reliable)
    const { error: supabaseOtpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (supabaseOtpError) {
      console.error('❌ Supabase OTP Error:', supabaseOtpError);
      const helpMsg = getOtpHelpMessage(supabaseOtpError.message);
      throw new Error(helpMsg);
    }

    console.log(`✓ OTP sent via Supabase built-in method to ${normalizedEmail}`);
    return 'supabase';
  };

  // ─── Social Authentication Handlers ───
  const getOAuthErrorMessage = (error: any, provider: string) => {
    const message = error?.message || '';
    
    if (message.includes('provider is not enabled') || message.includes('Unsupported provider')) {
      return `${provider} OAuth is not yet configured. Please contact support or check the documentation for setup instructions.`;
    }
    
    if (message.includes('Redirect URI mismatch')) {
      return 'There was a configuration error. Please contact support.';
    }
    
    if (message.includes('Invalid client')) {
      return 'OAuth provider configuration is invalid. Please contact support.';
    }
    
    return message || `Failed to sign in with ${provider}. Please try again.`;
  };

  const handleLinkedInSignIn = async () => {
    try {
      setIsLoading(true);
      const redirectUrl = getRedirectUrl('/auth/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid profile email',
        },
      });

      if (error) {
        throw error;
      }

      console.log('LinkedIn sign in initiated');
      toast({
        title: "Redirecting to LinkedIn",
        description: "You'll be redirected to complete your sign-in.",
      });
    } catch (error: any) {
      console.error('LinkedIn sign in error:', error);
      const errorMsg = getOAuthErrorMessage(error, 'LinkedIn');
      
      toast({
        variant: "destructive",
        title: "LinkedIn Sign In Failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const redirectUrl = getRedirectUrl('/auth/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'profile email',
        },
      });

      if (error) {
        throw error;
      }

      console.log('Google sign in initiated');
      toast({
        title: "Redirecting to Google",
        description: "You'll be redirected to complete your sign-in.",
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      const errorMsg = getOAuthErrorMessage(error, 'Google');
      
      toast({
        variant: "destructive",
        title: "Google Sign In Failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        // For signup, generate temporary password - user will set real password after email verification
        const tempPassword = generateSecureTempPassword();
        const { error, data } = await signUp(email, tempPassword, fullName, selectedRole);
        if (error) {
          const msg = getReadableError(error, 'Sign up failed. Please try again.');
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

        // Confirmation email already sent by Supabase during signup
        // Don't resend immediately - it hits rate limits
        setStep('confirm');
        setResendCooldown(60);
        setPassword('');
        setFullName('');
        
        toast({
          title: 'Account created!',
          description: 'Check your email to verify your account and set your password.',
        });
      } else {
        setOtpChallengePending(true);

        // Step 1: Verify password credentials
        const { error } = await signIn(email, password);
        if (error) {
          setOtpChallengePending(false);
          const msg = error.message || 'An unexpected error occurred';
          toast({ title: 'Sign in failed', description: msg, variant: 'destructive' });
          return;
        }

        // Step 2: Send OTP for second-factor verification while session is active
        // so edge-function fallback can pass JWT auth requirements.
        try {
          setStoredPassword(password); // Store password for OTP re-auth
          const method = await sendOtpCode(email);

          // Step 3: Sign out to enforce OTP challenge before dashboard access.
          await supabase.auth.signOut();

          setOtpMethod(method);
          setStep('otp');
          setOtpResendCooldown(60);
          setPassword(''); // Clear form
          setOtpChallengePending(false);
          toast({
            title: 'Verification code sent',
            description: method === 'edge'
              ? 'Check your email for the 6-digit code.'
              : 'Check your email for the Supabase verification code.',
          });
        } catch (otpErr: any) {
          // Important: Sign out the user if OTP sending fails to prevent premature redirect
          await supabase.auth.signOut();
          setOtpChallengePending(false);
          
          toast({
            title: 'Could not send verification code',
            description: getOtpHelpMessage(otpErr?.message || 'Please try again.'),
            variant: 'destructive',
          });
        }
      }
    } catch {
      // Sign out if there was any unexpected error during sign in
      try {
        await supabase.auth.signOut();
      } catch {}
      setOtpChallengePending(false);
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
          emailRedirectTo: getRedirectUrl('/auth?verified=true'),
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
    
    // Defensive check
    if (!email || !email.trim()) {
      toast({ title: 'Error', description: 'Email is missing. Please sign in again.', variant: 'destructive' });
      setStep('form');
      return;
    }

    if (otpCode.length !== 8) {
      toast({ title: 'Invalid code', description: 'Please enter the 8-digit code.', variant: 'destructive' });
      return;
    }

    // Prevent verification attempts during cooldown
    if (otpVerifyAttemptCooldown > 0) {
      toast({
        title: 'Too many attempts',
        description: `Please wait ${otpVerifyAttemptCooldown} seconds before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log(`🔐 Starting OTP verification for ${email} with code: ${otpCode}`);
    try {
      // Validate and trim OTP code
      const trimmedCode = otpCode.trim();
      
      if (!/^\d{8}$/.test(trimmedCode)) {
        throw new Error('OTP code must be exactly 8 digits with no spaces');
      }

      console.log('Calling verifyOtp with:', { email, tokenLength: trimmedCode.length });
      
      // Use Supabase's verifyOtp for email OTP verification (correct API for v2)
      const { error: otpVerifyError, data } = await supabase.auth.verifyOtp({
        email,
        token: trimmedCode,
        type: 'email',
      });

      console.log('OTP Response Data:', { data, error: otpVerifyError });

      if (otpVerifyError) {
        // Handle specific error types with user-friendly messages
        let userMsg = 'OTP verification failed';
        
        if (otpVerifyError.message?.includes('expired')) {
          userMsg = 'OTP code has expired. Please request a new one.';
        } else if (otpVerifyError.message?.includes('invalid') || otpVerifyError.message?.includes('Token')) {
          userMsg = 'Invalid OTP code. Please check and try again.';
        } else if (otpVerifyError.message?.includes('not found')) {
          userMsg = 'Email not found. Please check your email address.';
        } else {
          userMsg = otpVerifyError.message || 'OTP verification failed';
        }
        
        console.error('OTP Verify Error:', {
          status: otpVerifyError.status,
          message: otpVerifyError.message,
          userMessage: userMsg,
          fullError: otpVerifyError
        });
        
        setVerifyAttemptCount(prev => prev + 1);
        throw new Error(userMsg);
      }

      // Success - session should be in response
      console.log('✓ OTP verification successful, checking for session...');
      
      let activeSession: any = data?.session || null;
      let sessionReady = false;

      if (activeSession) {
        console.log('✓ Session found in OTP response:', activeSession.user?.email);
        sessionReady = true;
      } else {
        // If not in response, check if user was returned (session might be in auth state)
        console.log('No session in response, checking auth state...');
        
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to get session from auth state
        const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (authSession) {
          console.log('✓ Session found in auth state:', authSession.user?.email);
          activeSession = authSession;
          sessionReady = true;
        } else if (sessionError) {
          console.error('Error retrieving session:', sessionError);
        }
      }

      if (!sessionReady || !activeSession) {
        console.error('❌ Session establishment failed');
        console.error('OTP response data:', { data, error: otpVerifyError });
        console.error('Email:', email);
        throw new Error('Unable to establish session after verification. Please check your OTP code and try again.');
      }
      
      console.log(`✓ Session established for user: ${activeSession.user?.email}`);
        
      // Clear all OTP state IMMEDIATELY
      setOtpChallengePending(false);
      setStoredPassword('');
      setOtpCode('');
      setOtpVerifyAttemptCooldown(0);
      setVerifyAttemptCount(0);
      setResendAttemptCount(0);
      setIsLoading(false);

      toast({ title: 'Verified!', description: 'Redirecting to your dashboard...' });

      // Reset step to trigger useEffect redirect with full auth context
      setStep('form');

      // Redirect immediately since session is established
      setTimeout(async () => {
        try {
          console.log('🔄 OTP Verification: Initiating redirect...');
          
          // Get fresh session data to confirm authentication
          const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error during redirect:', sessionError);
            navigate('/tester', { replace: true });
            return;
          }

          if (!finalSession?.user) {
            console.error('❌ No active session found during redirect');
            navigate('/auth', { replace: true });
            return;
          }

          console.log(`✓ Session confirmed for redirect: ${finalSession.user.email}`);
          
          // Fetch user role for proper dashboard routing
          const { data: roleRows, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', finalSession.user.id)
            .single();
          
          if (roleError && roleError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Role fetch error:', roleError);
            // Default to tester if role fetch fails
            navigate('/tester', { replace: true });
            return;
          }

          const userRole = roleRows?.role || 'tester';
          console.log(`✓ User role determined: ${userRole}`);
          
          // Route to appropriate dashboard
          if (userRole === 'recruiter') {
            console.log('→ Redirecting to recruiter dashboard');
            navigate('/recruiter', { replace: true });
          } else if (userRole === 'admin') {
            console.log('→ Redirecting to admin dashboard');
            navigate('/admin', { replace: true });
          } else {
            console.log('→ Redirecting to tester dashboard');
            navigate('/tester', { replace: true });
          }
        } catch (navErr) {
          console.error('❌ Navigation error:', navErr);
          navigate('/tester', { replace: true });
        }
      }, 100);  // Small delay for state updates, session already confirmed
      return;
    } catch (err: any) {
      console.error('❌ OTP Verification Error:', {
        method: otpMethod,
        email,
        code: otpCode,
        error: err,
        message: err.message,
        status: err.status,
      });

      const errorMsg = err.message || 'Invalid or expired code. Please try again.';
      const lowerMsg = errorMsg.toLowerCase();
      
      // Detect rate limit errors - Supabase sends these messages:
      // 1. HTTP 429 status
      // 2. "For security, please wait X seconds before trying again"
      // 3. "For security purposes, you can only request this after X seconds"
      // 4. Contains "rate limit" or "too many requests"
      const isRateLimitError = err.status === 429 || 
                               (lowerMsg.includes('for security') && lowerMsg.includes('seconds')) ||
                               lowerMsg.includes('rate limit') ||
                               lowerMsg.includes('too many requests');
      
      if (isRateLimitError) {
        // Extract cooldown time from error message - use ONLY what Supabase specifies
        const timeMatch = errorMsg.match(/(\d+)\s*seconds?/i);
        const cooldownTime = timeMatch ? parseInt(timeMatch[1]) : 60;
        
        console.log(`⏱ Supabase rate limit: wait ${cooldownTime}s before trying again`);
        toast({
          title: 'Too many attempts',
          description: `Please wait ${cooldownTime} seconds before trying again.`,
          variant: 'destructive',
        });
        setOtpVerifyAttemptCooldown(cooldownTime);
        // Don't increment attempt count - only Supabase's rate limit matters
      } else {
        // Regular verification error (wrong code, expired code, etc) - allow immediate retry
        console.log('✗ Verification failed:', errorMsg);
        toast({
          title: 'Verification failed',
          description: errorMsg,
          variant: 'destructive',
        });
        // Don't set any cooldown for non-rate-limit errors - user can retry immediately
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return;
    
    setIsLoading(true);
    setOtpCode(''); // Clear previous code
    
    try {
      const method = await sendOtpCode(email);
      setOtpMethod(method);
      
      // Only set cooldown AFTER successful send
      setOtpResendCooldown(60);
      // Reset verification attempt count on successful resend
      setVerifyAttemptCount(0);

      toast({
        title: 'New code sent ✓',
        description: `Check ${email} for the fresh verification code.`,
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Please try again in a moment.';
      const lowerMsg = errMsg.toLowerCase();
      
      // Detect rate limit errors - multiple patterns from Supabase:
      // 1. Message contains "For security purposes"
      // 2. Message contains "rate limit"
      // 3. Message contains "too many requests"
      const isRateLimitError = lowerMsg.includes('for security purposes') ||
                               lowerMsg.includes('rate limit') ||
                               lowerMsg.includes('too many requests');
      
      if (isRateLimitError) {
        // Extract actual cooldown time from error message (e.g., "18 seconds")
        const timeMatch = errMsg.match(/(\d+)\s*seconds?/i);
        const supabaseCooldown = timeMatch ? parseInt(timeMatch[1]) : 60;
        
        // Apply exponential backoff: add extra delay on repeated failures
        const exponentialDelay = Math.min(supabaseCooldown + (resendAttemptCount * 10), 180);
        
        console.log(`⏱ Resend rate limited for ${exponentialDelay}s (from Supabase: ${supabaseCooldown}s)`);
        toast({
          title: 'Too many requests',
          description: `Please wait ${exponentialDelay} seconds before requesting another code.`,
          variant: 'destructive',
        });
        // Set cooldown to Supabase's specified time + exponential backoff
        setOtpResendCooldown(exponentialDelay);
        setResendAttemptCount(resendAttemptCount + 1);
      } else {
        toast({
          title: 'Failed to resend',
          description: getOtpHelpMessage(errMsg),
          variant: 'destructive',
        });
        // Reset attempt count on non-rate-limit errors
        setResendAttemptCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOtp = async () => {
    // User was already signed out after password verification
    setStep('form');
    setOtpChallengePending(false);
    setOtpCode('');
    setStoredPassword(''); // Clear stored password for security
    setVerifyAttemptCount(0); // Reset attempt counts
    setResendAttemptCount(0);
    toast({ title: 'Sign in cancelled', description: 'Please sign in again to continue.' });
  };

  const pageTitle = step === 'forgot' ? 'Reset your password'
    : step === 'confirm' ? 'Confirm your email'
    : step === 'otp' ? 'Verify your identity'
    : isSignUp ? 'Create your account' : 'Welcome back';

  const pageSubtitle = step === 'forgot' ? "Enter your email and we'll send you a reset link"
    : step === 'confirm' ? `Use the link we sent to ${email} to activate your account`
    : step === 'otp' ? `Enter the 8-digit code sent to ${email}`
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
                    {otpMethod === 'supabase'
                      ? <>We sent a sign-in code (or magic link) to <strong className="text-foreground">{email}</strong>. Use the code below to complete sign-in.</>
                      : <>We've sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>. Enter it below to complete your sign-in.</>}
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otpCode" className="text-sm">Verification Code</Label>
                      <Input
                        id="otpCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        placeholder="00000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                        autoFocus
                        autoComplete="one-time-code"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 8 || otpVerifyAttemptCooldown > 0}>
                      {isLoading ? 'Verifying...' : otpVerifyAttemptCooldown > 0 ? `Wait ${otpVerifyAttemptCooldown}s` : 'Verify & Sign In'}
                      {!isLoading && otpVerifyAttemptCooldown <= 0 && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>

                  <div className="text-center space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {otpResendCooldown > 0 
                        ? `⏱ Wait ${otpResendCooldown}s before requesting a new code (Supabase security limit)`
                        : 'Didn\'t receive the code?'}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendCooldown > 0 || isLoading || otpVerifyAttemptCooldown > 0}
                      className={`text-sm transition-colors inline-flex items-center gap-1.5 ${
                        otpResendCooldown > 0 || isLoading || otpVerifyAttemptCooldown > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-primary hover:text-primary/80 hover:underline cursor-pointer'
                      }`}
                    >
                      {isLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                      {!isLoading && otpResendCooldown <= 0 && otpVerifyAttemptCooldown <= 0 && <RotateCw className="w-3.5 h-3.5" />}
                      {otpResendCooldown > 0 ? `Resend in ${otpResendCooldown}s` : otpVerifyAttemptCooldown > 0 ? `Try again in ${otpVerifyAttemptCooldown}s` : 'Resend code'}
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
                    
                    
                    {!isSignUp && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm">Password</Label>
                          <button type="button" onClick={() => { setStep('forgot'); setErrors({}); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>
                    )}
                    <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 h-11" disabled={isLoading}>
                      {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>

                  {/* Social Authentication Buttons */}
                  <div className="mt-6 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                      </div>
                    </div>

                    {selectedRole === 'tester' || (!isSignUp && selectedRole === 'tester') ? (
                      <Button
                        type="button"
                        onClick={handleLinkedInSignIn}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full rounded-xl gap-2 h-11 border-border/60 hover:bg-muted"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full rounded-xl gap-2 h-11 border-border/60 hover:bg-muted"
                    >
                      <Chrome className="h-4 w-4" />
                      Google
                    </Button>
                  </div>
                  
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
