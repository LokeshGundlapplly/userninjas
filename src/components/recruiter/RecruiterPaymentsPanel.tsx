import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  CreditCard, Zap, Building2, Rocket, TrendingUp, Download,
  CheckCircle, Clock, XCircle, Wallet, Receipt, RefreshCw,
  ArrowUpRight, ShieldCheck, Sparkles, AlertCircle, Crown,
  Ticket, Shield, Sparkle
} from 'lucide-react';
import { useAuth, type UserProfile, type Subscription } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────

interface PaymentRecord {
  id: string;
  user_id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string | null;
  description: string | null;
  created_at: string;
}

interface RecruiterPaymentsPanelProps {
  user: User;
  profile: UserProfile | null;
  onUpgradePlan: () => void;
  onProfileRefresh: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_META: Record<string, { label: string; color: string; bg: string; icon: any; studyLimit: number; description: string }> = {
  free: {
    label: 'Free',
    color: 'text-muted-foreground',
    bg: 'bg-secondary/60',
    icon: Rocket,
    studyLimit: 2,
    description: '2 studies lifetime · 25 responses / study',
  },
  per_test: {
    label: 'Pay-Per-Test',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    icon: Ticket,
    studyLimit: 1,
    description: '1 custom test created · Valid 30 days · Max 50 candidates / test',
  },
  monthly: {
    label: 'Standard (Monthly)',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    icon: Zap,
    studyLimit: 5,
    description: 'Max 5 active tests · Up to 200 candidates / month · Basic reporting',
  },
  yearly: {
    label: 'Enterprise (Yearly)',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    icon: Crown,
    studyLimit: 99999,
    description: 'Unlimited tests · Up to 3,000 candidates / year · Advanced analytics & export · Priority support',
  },
  pro: {
    label: 'Standard (Pro)',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    icon: Zap,
    studyLimit: 25,
    description: '25 active studies / month · 2,000 responses',
  },
  enterprise: {
    label: 'Enterprise',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    icon: Building2,
    studyLimit: 999,
    description: 'Unlimited studies · Unlimited responses',
  },
};

const CREDIT_PRESETS = [
  { label: '₹500', amount: 500, tag: null },
  { label: '₹1,000', amount: 1000, tag: 'Popular' },
  { label: '₹2,000', amount: 2000, tag: null },
  { label: '₹5,000', amount: 5000, tag: 'Best value' },
];

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case 'successful':
      return <Badge className="bg-green-500/15 text-green-500 border-green-500/30 border gap-1"><CheckCircle className="h-3 w-3" />Successful</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500/15 text-yellow-500 border-yellow-500/30 border gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    case 'failed':
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 border gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function generateInvoiceHTML(payment: PaymentRecord, userEmail: string) {
  const date = new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const desc = payment.description || (payment.plan_type ? `${payment.plan_type.charAt(0).toUpperCase() + payment.plan_type.slice(1)} Plan Subscription` : 'Wallet Credit Top-up');
  return `
    <!DOCTYPE html><html><head><title>Invoice – UserNinjas</title>
    <style>
      body { font-family: 'Helvetica Neue', sans-serif; padding: 40px; color: #111; max-width: 640px; margin: auto; }
      h1 { font-size: 24px; margin-bottom: 4px; } .sub { color: #666; font-size: 14px; }
      .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
      .label { color: #666; } .val { font-weight: 600; }
      hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
      .total { font-size: 18px; font-weight: 700; }
      .footer { margin-top: 40px; font-size: 12px; color: #aaa; text-align: center; }
      .badge { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
    </style></head><body>
    <h1>UserNinjas</h1><p class="sub">Tax Invoice / Receipt</p>
    <hr/>
    <div class="row"><span class="label">Invoice ID</span><span class="val">${payment.id.slice(0, 8).toUpperCase()}</span></div>
    <div class="row"><span class="label">Date</span><span class="val">${date}</span></div>
    <div class="row"><span class="label">Billed To</span><span class="val">${userEmail}</span></div>
    <div class="row"><span class="label">Gateway</span><span class="val">${payment.gateway.charAt(0).toUpperCase() + payment.gateway.slice(1)}</span></div>
    <hr/>
    <div class="row"><span class="label">Description</span><span class="val">${desc}</span></div>
    <div class="row"><span class="label">Status</span><span><span class="badge">${payment.status}</span></span></div>
    <hr/>
    <div class="row total"><span>Total Charged</span><span>₹${Number(payment.amount).toLocaleString('en-IN')}</span></div>
    <p class="footer">Thank you for using UserNinjas · support@userninjas.com · userninjas.com</p>
    </body></html>
  `;
}

// ─── Main Component ───────────────────────────────────────

export default function RecruiterPaymentsPanel({
  user, profile, onUpgradePlan, onProfileRefresh,
}: RecruiterPaymentsPanelProps) {
  const { toast } = useToast();
  const { subscription, refreshProfile } = useAuth();

  const [tab, setTab] = useState<'overview' | 'history' | 'credits'>('overview');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [studiesUsed, setStudiesUsed] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'per_test' | 'monthly' | 'yearly'>('monthly');

  const planKey = subscription?.plan_type || profile?.plan_type || 'free';
  const planMeta = PLAN_META[planKey] || PLAN_META.free;
  const PlanIcon = planMeta.icon;
  const studyLimit = subscription ? (planKey === 'per_test' ? 1 : subscription.active_test_limit) : (profile?.study_limit ?? planMeta.studyLimit);

  // ─── Fetch data ───────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments((data as PaymentRecord[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  }, [user.id]);

  const fetchWallet = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('user_id', user.id)
      .single();
    if (data && typeof (data as any).wallet_balance === 'number') {
      setWalletBalance((data as any).wallet_balance);
    }
  }, [user.id]);

  const fetchStudiesUsed = useCallback(async () => {
    const { count } = await supabase
      .from('tests')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', user.id);
    setStudiesUsed(count ?? 0);
  }, [user.id]);

  useEffect(() => {
    fetchPayments();
    fetchWallet();
    fetchStudiesUsed();
  }, [fetchPayments, fetchWallet, fetchStudiesUsed]);

  // ─── Razorpay helpers ──────────────────────────────────

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleAddCredits = async () => {
    const amount = customAmount ? parseInt(customAmount, 10) : selectedPreset;
    if (!amount || amount < 100) {
      toast({ title: 'Minimum ₹100', description: 'Please enter at least ₹100.', variant: 'destructive' });
      return;
    }

    setProcessingPayment(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load.', variant: 'destructive' });
        return;
      }

      // Generate Order ID via backend/Vercel serverless function
      const apiResponse = await fetch(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'https://www.userninjas.in/api/create-razorpay-order' 
          : '/api/create-razorpay-order', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        }
      );

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        throw new Error(errData.error || 'Failed to initialize payment transaction');
      }

      const order = await apiResponse.json();

      const options = {
        key: 'rzp_live_Sx5YIPbX0SGPU4',
        amount: (amount * 100).toString(),
        currency: 'INR',
        name: 'User Ninjas',
        description: 'Wallet Credit Top-up',
        image: 'https://userninjas.com/logo.png',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Insert payment record
            await supabase.from('payments').insert({
              user_id: user.id,
              gateway: 'razorpay',
              amount,
              currency: 'INR',
              status: 'successful',
              plan_type: null,
              description: `Wallet top-up – ₹${amount.toLocaleString('en-IN')}`,
            });

            // Update wallet balance
            await supabase.rpc('increment_wallet_balance', {
              p_user_id: user.id,
              p_amount: amount,
            }).then(async ({ error }) => {
              if (error) {
                // Fallback: direct update
                const { data: prof } = await supabase
                  .from('profiles')
                  .select('wallet_balance')
                  .eq('user_id', user.id)
                  .single();
                const current = (prof as any)?.wallet_balance || 0;
                await supabase
                  .from('profiles')
                  .update({ wallet_balance: current + amount })
                  .eq('user_id', user.id);
              }
            });

            await fetchWallet();
            await fetchPayments();
            toast({ title: '₹' + amount.toLocaleString('en-IN') + ' added!', description: 'Your wallet has been credited successfully.' });
            setAddCreditsOpen(false);
            setCustomAmount('');
            setSelectedPreset(1000);
          } catch (err: any) {
            toast({ title: 'Error', description: 'Payment succeeded but wallet update failed. Contact support.', variant: 'destructive' });
          }
        },
        prefill: { email: user.email },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast({ title: 'Payment Failed', description: r.error.description, variant: 'destructive' });
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not open payment window.', variant: 'destructive' });
    } finally {
      setProcessingPayment(false);
    }
  };

  const processRazorpayPayment = async () => {
    setProcessingPayment(true);
    try {
      const planDetails = {
        per_test: { name: 'Pay-Per-Test (A La Carte Plan)', priceINR: 999, days: 30, testLimit: 1, inviteLimit: 50 },
        monthly: { name: 'Monthly Subscription (Standard Tier)', priceINR: 2999, days: 30, testLimit: 5, inviteLimit: 200 },
        yearly: { name: 'Yearly Subscription (Enterprise/Premium Tier)', priceINR: 30590, days: 365, testLimit: 99999, inviteLimit: 3000 }
      }[selectedCheckoutPlan];

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load.', variant: 'destructive' });
        setProcessingPayment(false);
        return;
      }

      // Generate Order ID via backend/Vercel serverless function
      const apiResponse = await fetch(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'https://www.userninjas.in/api/create-razorpay-order' 
          : '/api/create-razorpay-order', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: planDetails.priceINR })
        }
      );

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        throw new Error(errData.error || 'Failed to initialize payment transaction');
      }

      const order = await apiResponse.json();

      const amount = planDetails.priceINR * 100; // in paise
      const options = {
        key: 'rzp_live_Sx5YIPbX0SGPU4',
        amount: amount.toString(),
        currency: 'INR',
        name: 'User Ninjas',
        description: `Upgrade to ${planDetails.name}`,
        image: 'https://userninjas.com/logo.png',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + planDetails.days);

            // 1. Insert payment record
            await supabase.from('payments').insert({
              user_id: user.id,
              gateway: 'razorpay',
              amount: planDetails.priceINR,
              currency: 'INR',
              status: 'successful',
              plan_type: selectedCheckoutPlan,
              description: `Purchased: ${planDetails.name} (Payment ID: ${response.razorpay_payment_id})`
            });

            // 2. Upsert subscription record
            const { error: subErr } = await supabase.from('subscriptions').upsert({
              user_id: user.id,
              plan_type: selectedCheckoutPlan,
              payment_status: 'success',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              is_valid: true,
              tests_created: 0,
              invites_sent: 0,
              active_test_limit: planDetails.testLimit,
              invite_limit: planDetails.inviteLimit,
            }, { onConflict: 'user_id' });

            if (subErr) throw subErr;

            // 3. Update profiles table for backward compatibility
            await supabase.from('profiles').update({
              plan_type: selectedCheckoutPlan,
              study_limit: planDetails.testLimit,
              subscription_status: 'active',
              subscription_end: endDate.toISOString(),
            }).eq('user_id', user.id);

            toast({
              title: 'Subscription Active!',
              description: `You are now subscribed to the ${planDetails.name}.`,
            });

            await refreshProfile();
            if (onProfileRefresh) await onProfileRefresh();
            await fetchPayments();
            setCheckoutOpen(false);
          } catch (err: any) {
            console.error('Error updating subscription:', err);
            toast({
              title: 'Error updating subscription',
              description: err.message || 'Payment was recorded but profile update failed.',
              variant: 'destructive',
            });
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: { email: user.email },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        try {
          await supabase.from('payments').insert({
            user_id: user.id,
            gateway: 'razorpay',
            amount: planDetails.priceINR,
            currency: 'INR',
            status: 'failed',
            plan_type: selectedCheckoutPlan,
            description: `Failed purchase: ${planDetails.name} (${response.error.description})`
          });
        } catch (e) {
          console.error('Error inserting failed payment record:', e);
        }
        toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' });
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to start payment.', variant: 'destructive' });
      setProcessingPayment(false);
    }
  };

  // ─── Export ────────────────────────────────────────────

  const exportPaymentHistory = () => {
    const headers = ['Date', 'Description', 'Amount (INR)', 'Status', 'Type', 'Gateway'];
    const rows = payments.map(p => [
      new Date(p.created_at).toLocaleDateString('en-IN'),
      p.description || (p.plan_type ? `${p.plan_type} Plan` : 'Credit top-up'),
      p.amount.toString(),
      p.status,
      p.plan_type ? 'Subscription' : 'Wallet Credit',
      p.gateway,
    ]);
    downloadCSV(`payments_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Exported', description: `${rows.length} records downloaded.` });
  };

  const downloadInvoice = (payment: PaymentRecord) => {
    const html = generateInvoiceHTML(payment, user.email || '');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.onload = () => { win.print(); };
  };

  // ─── Computed ─────────────────────────────────────────

  const totalSpent = payments.filter(p => p.status === 'successful').reduce((s, p) => s + Number(p.amount), 0);
  const studyUsagePercent = studyLimit >= 999 ? 5 : Math.min(100, Math.round((studiesUsed / studyLimit) * 100));

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1 w-fit">
        {([
          { key: 'overview', label: 'Overview', icon: CreditCard },
          { key: 'credits', label: 'Add Credits', icon: Wallet },
          { key: 'history', label: 'Payment History', icon: Receipt },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Active Subscription Status Banner */}
          <Card className="border border-border/60 overflow-hidden relative bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card backdrop-blur-md">
            <div className="absolute inset-0 opacity-[0.02] bg-grid-white" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${planMeta.bg} flex items-center justify-center`}>
                      <PlanIcon className={`h-4.5 w-4.5 ${planMeta.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active Plan</p>
                      <h3 className={`text-xl font-bold font-display ${planMeta.color}`}>{planMeta.label}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {planMeta.description}
                  </p>
                  {subscription && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1.5">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Started: {new Date(subscription.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Renews/Expires: {new Date(subscription.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col items-end gap-3 w-full md:w-auto shrink-0">
                  <div className="flex items-center gap-2">
                    <Badge className={subscription?.is_valid ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 border" : "bg-yellow-500/15 text-yellow-500 border-yellow-500/30 border"}>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {subscription?.is_valid ? 'Active Account' : 'Free Account'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold text-green-500">₹{walletBalance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Progress Counters */}
              {subscription && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/40">
                  {/* Test creation limit */}
                  {planKey !== 'yearly' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Tests Created This Period</span>
                        <span className="font-semibold">{subscription.tests_created} / {subscription.active_test_limit}</span>
                      </div>
                      <Progress value={Math.min(100, (subscription.tests_created / subscription.active_test_limit) * 100)} className="h-2" />
                    </div>
                  )}
                  {/* Candidates/Invites Limit */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Candidate Submissions / Invites</span>
                      <span className="font-semibold">{subscription.invites_sent} / {subscription.invite_limit}</span>
                    </div>
                    <Progress value={Math.min(100, (subscription.invites_sent / subscription.invite_limit) * 100)} className="h-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Model / Plan Options Selection Grid */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Choose Subscription Plan
              </h3>
              <p className="text-sm text-muted-foreground">
                Select the pricing model that best fits your recruitment volume. Upgrade or switch anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pay-Per-Test */}
              <Card className={`border ${planKey === 'per_test' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60'} hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden relative`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2">
                      <Ticket className="h-4 w-4 text-orange-400" />
                    </div>
                    {planKey === 'per_test' && <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20">Current</Badge>}
                  </div>
                  <CardTitle className="text-base font-bold">Pay-Per-Test</CardTitle>
                  <CardDescription className="text-xs">Perfect for occasional researchers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold font-display">₹999</span>
                      <span className="text-xs text-muted-foreground">/ custom test</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> 1 Custom Research Test</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Max 50 Candidate Invites / test</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Valid for 30 days</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Basic reporting dashboard</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => { setSelectedCheckoutPlan('per_test'); setCheckoutOpen(true); }}
                    className="w-full mt-4 h-9 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Monthly Subscription */}
              <Card className={`border ${planKey === 'monthly' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60'} hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden relative`}>
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl">RECOMMENDED</div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2">
                      <Zap className="h-4 w-4 text-indigo-400" />
                    </div>
                    {planKey === 'monthly' && <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Current</Badge>}
                  </div>
                  <CardTitle className="text-base font-bold">Monthly Standard</CardTitle>
                  <CardDescription className="text-xs">For teams running recurring monthly testing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold font-display">₹2,999</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Max 5 active test links at a time</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Up to 200 invites / month</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Standard screener templates</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Basic reporting dashboard</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => { setSelectedCheckoutPlan('monthly'); setCheckoutOpen(true); }}
                    className="w-full mt-4 h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Yearly Premium */}
              <Card className={`border ${planKey === 'yearly' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60'} hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden relative`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                      <Crown className="h-4 w-4 text-amber-400" />
                    </div>
                    {planKey === 'yearly' && <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">Current</Badge>}
                  </div>
                  <CardTitle className="text-base font-bold">Yearly Enterprise</CardTitle>
                  <CardDescription className="text-xs">Unlimited access & priority support.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline gap-1 mb-4 flex-wrap">
                      <span className="text-3xl font-extrabold font-display">₹30,590</span>
                      <span className="text-xs text-muted-foreground">/ year</span>
                      <Badge className="ml-1 text-[9px] bg-green-500/15 text-green-500 border border-green-500/20">Save 15%</Badge>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Unlimited active test links</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Up to 3,000 invites / year</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Advanced analytics & exports</li>
                      <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> Priority developer support</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => { setSelectedCheckoutPlan('yearly'); setCheckoutOpen(true); }}
                    className="w-full mt-4 h-9 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ADD CREDITS TAB ══════════ */}
      {tab === 'credits' && (
        <div className="space-y-5 max-w-xl">
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-500" /> Add Wallet Credits
              </CardTitle>
              <CardDescription>
                Credits are used to fund tester rewards. Choose an amount below or enter a custom value.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Current balance */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Wallet className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-bold text-green-500">₹{walletBalance.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Preset amounts */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Amount</Label>
                <div className="grid grid-cols-2 gap-3">
                  {CREDIT_PRESETS.map(preset => (
                    <button
                      key={preset.amount}
                      onClick={() => { setSelectedPreset(preset.amount); setCustomAmount(''); }}
                      className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${selectedPreset === preset.amount && !customAmount
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                          : 'border-border/60 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40'}`}
                    >
                      {preset.tag && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                          {preset.tag}
                        </span>
                      )}
                      <span className="text-xl font-bold font-display">{preset.label}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        ≈ {Math.floor(preset.amount / 200)} tester rewards
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">Custom Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="100"
                    step="100"
                    placeholder="Enter amount (min ₹100)"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                    className="pl-7"
                  />
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleAddCredits}
                disabled={processingPayment || (!selectedPreset && !customAmount)}
                className="w-full h-11 gap-2 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/20"
              >
                {processingPayment ? (
                  <><Sparkles className="h-4 w-4 animate-pulse" /> Processing…</>
                ) : (
                  <><Wallet className="h-4 w-4" /> Pay ₹{(customAmount ? parseInt(customAmount) : selectedPreset || 0).toLocaleString('en-IN')} via Razorpay</>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                Supports UPI · Cards · Net Banking · Wallets · Instant credit
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════ PAYMENT HISTORY TAB ══════════ */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {payments.length} transaction{payments.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { fetchPayments(); fetchWallet(); }}
                className="gap-1.5 h-8 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportPaymentHistory}
                disabled={payments.length === 0}
                className="gap-1.5 h-8 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          {loadingPayments ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <Card className="border border-border/60">
              <CardContent className="py-14 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No payments yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your payment history will appear here once you upgrade your plan or add wallet credits.
                </p>
                <Button
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => setTab('credits')}
                >
                  <Wallet className="h-3.5 w-3.5" /> Add Credits
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[200px] truncate">
                        {p.description || (p.plan_type
                          ? `${p.plan_type.charAt(0).toUpperCase() + p.plan_type.slice(1)} Plan`
                          : 'Wallet Top-up'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.plan_type ? 'Subscription' : 'Credits'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(p.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === 'successful' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadInvoice(p)}
                            className="h-7 w-7 p-0 rounded-lg"
                            title="Download Invoice"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* ── Add Credits Dialog (accessible from Overview too) ── */}
      <Dialog open={addCreditsOpen} onOpenChange={setAddCreditsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" /> Add Wallet Credits
            </DialogTitle>
            <DialogDescription>
              Choose an amount to add to your wallet. Funds are credited instantly after payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              {CREDIT_PRESETS.map(preset => (
                <button
                  key={preset.amount}
                  onClick={() => { setSelectedPreset(preset.amount); setCustomAmount(''); }}
                  className={`relative flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${selectedPreset === preset.amount && !customAmount
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:border-primary/40'}`}
                >
                  <span className="font-bold text-sm">{preset.label}</span>
                  {preset.tag && (
                    <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                      {preset.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
              <Input
                type="number"
                min="100"
                placeholder="Custom amount (min ₹100)"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                className="pl-7"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCreditsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddCredits}
              disabled={processingPayment || (!selectedPreset && !customAmount)}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            >
              {processingPayment
                ? <><Sparkles className="h-4 w-4 animate-pulse" />Processing…</>
                : <><Wallet className="h-4 w-4" />Pay ₹{(customAmount ? parseInt(customAmount) : selectedPreset || 0).toLocaleString('en-IN')}</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Secure Checkout Session Modal ── */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md border border-border/60 shadow-2xl rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Shield className="h-5 w-5 text-primary" /> Secure Payment Checkout
            </DialogTitle>
            <DialogDescription>
              Initialize payment processing session for UserNinjas subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Selected Plan Details Banner */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Selected Tier</p>
              <h4 className="font-bold text-sm text-foreground">
                {{
                  per_test: 'Pay-Per-Test (A La Carte Plan)',
                  monthly: 'Monthly Subscription (Standard Tier)',
                  yearly: 'Yearly Subscription (Enterprise/Premium Tier)'
                }[selectedCheckoutPlan]}
              </h4>
              <p className="text-lg font-extrabold text-primary font-display mt-2">
                {{
                  per_test: '₹999 single payment',
                  monthly: '₹2,999 / month',
                  yearly: '₹30,590 / year'
                }[selectedCheckoutPlan]}
              </p>
            </div>

            {/* Checkout info */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upon clicking proceed, the secure Razorpay payment window will load. Please complete the transaction to activate your subscription tier.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} disabled={processingPayment} className="w-full sm:w-auto h-9 text-xs">
              Cancel
            </Button>
            <Button
              onClick={processRazorpayPayment}
              disabled={processingPayment}
              className="w-full sm:w-auto h-9 text-xs bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-semibold"
            >
              {processingPayment ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
