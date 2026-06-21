import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  CreditCard, Zap, TrendingUp, Download,
  CheckCircle, Clock, XCircle, Wallet, Receipt, RefreshCw,
  Sparkles, Crown,
  Ticket, Shield, ArrowRight,
  FileText, BarChart3, Users, Activity, ChevronRight,
  Lock, Building2, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { useAuth, type UserProfile } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────

export interface PaymentRecord {
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

const PLAN_META: Record<string, {
  label: string; color: string; bg: string; border: string;
  gradient: string; icon: any; studyLimit: number; description: string;
  accentColor: string;
}> = {
  free: {
    label: 'Free',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    gradient: 'from-slate-600/20 to-slate-700/10',
    accentColor: '#94a3b8',
    icon: Ticket,
    studyLimit: 2,
    description: '2 studies lifetime · 25 responses / study',
  },
  per_test: {
    label: 'Pay-Per-Test',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    gradient: 'from-orange-600/20 to-amber-600/10',
    accentColor: '#f97316',
    icon: Ticket,
    studyLimit: 1,
    description: '1 custom test · Valid 30 days · Max 50 candidates',
  },
  monthly: {
    label: 'Standard',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    gradient: 'from-violet-600/20 to-indigo-600/10',
    accentColor: '#8b5cf6',
    icon: Zap,
    studyLimit: 5,
    description: 'Max 5 active tests · Up to 200 candidates / month',
  },
  yearly: {
    label: 'Enterprise',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-600/20 to-orange-600/10',
    accentColor: '#f59e0b',
    icon: Crown,
    studyLimit: 99999,
    description: 'Unlimited tests · 3,000 candidates / year · Priority support',
  },
  pro: {
    label: 'Pro',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    gradient: 'from-violet-600/20 to-indigo-600/10',
    accentColor: '#8b5cf6',
    icon: Zap,
    studyLimit: 25,
    description: '25 active studies / month · 2,000 responses',
  },
  enterprise: {
    label: 'Enterprise',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-600/20 to-orange-600/10',
    accentColor: '#f59e0b',
    icon: Building2,
    studyLimit: 999,
    description: 'Unlimited studies · Unlimited responses',
  },
};

const CREDIT_PRESETS = [
  { label: '₹500', amount: 500, tag: null, rewards: 2 },
  { label: '₹1,000', amount: 1000, tag: 'Popular', rewards: 5 },
  { label: '₹2,000', amount: 2000, tag: null, rewards: 10 },
  { label: '₹5,000', amount: 5000, tag: 'Best value', rewards: 25 },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { icon: any; label: string; cls: string }> = {
    successful: { icon: CheckCircle, label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    pending:    { icon: Clock,       label: 'Pending', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    failed:     { icon: XCircle,     label: 'Failed', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  const m = map[status] || { icon: AlertCircle, label: status, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${m.cls}`}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

export function generateInvoiceHTML(payment: PaymentRecord, userEmail: string, profile: any) {
  const date = new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  let itemDescription = payment.description || (payment.plan_type ? `${payment.plan_type.charAt(0).toUpperCase() + payment.plan_type.slice(1)} Plan` : 'Wallet Credit Top-up');
  
  const isINR = payment.currency === 'INR' || String(payment.gateway).toLowerCase() === 'razorpay';
  const currencySymbol = isINR ? '₹' : payment.currency === 'USD' ? '$' : payment.currency || '₹';
  const totalAmount = Number(payment.amount);
  
  let subtotal = totalAmount;
  let taxDetailsHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <span>${currencySymbol}${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Tax (0% Nil)</span>
      <span>${currencySymbol}0.00</span>
    </div>
  `;

  let invoiceNumber = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
  let billedToName = profile?.full_name || 'Valued Recruiter';
  let userEmailToDisplay = userEmail || 'in.gundlapplly@gmail.com';

  // Check for custom manual overrides inside description
  const desc = payment.description || '';
  if (desc && desc.includes('|')) {
    const parts = desc.split('|');
    itemDescription = parts[0].trim();
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith('Name:')) {
        billedToName = part.substring(5).trim();
      } else if (part.startsWith('Email:')) {
        userEmailToDisplay = part.substring(6).trim();
      } else if (part.startsWith('Request ID:')) {
        invoiceNumber = part.substring(11).trim();
      }
    }
  }

  const billedToCompany = profile?.company || 'N/A';
  const billedToLocation = profile?.location || 'N/A';
  const billedToPhone = profile?.phone || 'N/A';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - UserNinjas</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Inter', sans-serif; 
      background: #f8fafc; 
      color: #0f172a; 
      padding: 40px 20px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    
    .wrapper { 
      max-width: 800px; 
      margin: 0 auto; 
      background: #fff; 
      border-radius: 16px; 
      box-shadow: 0 4px 30px rgba(0,0,0,0.05); 
      border: 1px solid #e2e8f0;
      overflow: hidden; 
    }
    
    .header { 
      background: linear-gradient(135deg, #4f46e5, #7c3aed); 
      padding: 40px; 
      color: white; 
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .invoice-logo {
      height: 48px;
      width: 48px;
      object-fit: contain;
      border-radius: 8px;
      background: white;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .logo-text h1 { 
      font-size: 26px; 
      font-weight: 800; 
      letter-spacing: -0.5px; 
      margin-bottom: 2px;
      line-height: 1;
    }
    
    .logo-text span { 
      opacity: 0.85; 
      font-weight: 400; 
      font-size: 13px; 
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: block;
    }
    
    .invoice-meta {
      text-align: right;
    }
    .invoice-id { 
      background: rgba(255,255,255,0.15); 
      border-radius: 8px; 
      padding: 8px 16px; 
      font-size: 13px; 
      font-weight: 700; 
      letter-spacing: 1px; 
      display: inline-block;
      margin-bottom: 8px;
    }
    .invoice-date {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .body { padding: 40px; }
    
    .addresses-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 40px; 
      margin-bottom: 40px; 
    }
    
    .address-col h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    
    .address-details {
      font-size: 14px;
      color: #334155;
    }
    .address-details strong {
      color: #0f172a;
      font-size: 15px;
      display: block;
      margin-bottom: 4px;
    }
    .address-details p {
      margin-bottom: 3px;
    }
    
    .table-container {
      margin-bottom: 30px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    th {
      background: #f8fafc;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #475569;
      padding: 14px 16px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    td {
      padding: 16px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    
    .item-desc {
      font-weight: 600;
      color: #0f172a;
    }
    .item-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .totals-box {
      width: 320px;
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e2e8f0;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #475569;
      margin-bottom: 10px;
    }
    
    .summary-row.grand-total {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px dashed #cbd5e1;
      font-size: 18px;
      font-weight: 800;
      color: #4f46e5;
    }
    
    .payment-status-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 20px;
    }
    
    .footer { 
      background: #f8fafc; 
      padding: 30px 40px; 
      text-align: center; 
      font-size: 12px; 
      color: #94a3b8; 
      border-top: 1px solid #e2e8f0; 
      line-height: 1.6;
    }
    .footer a { color: #4f46e5; text-decoration: none; font-weight: 500; }
    
    @media print {
      body { background: white; padding: 0; }
      .wrapper { border: none; box-shadow: none; max-width: 100%; }
      .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; color: white !important; }
      .totals-box { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-container">
        <img src="${window.location.origin + '/logo.png'}" alt="UserNinjas Logo" class="invoice-logo" />
        <div class="logo-text">
          <h1>UserNinjas</h1>
          <span>Tax Invoice / Receipt</span>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-id">${invoiceNumber}</div>
        <div class="invoice-date">Date: ${date}</div>
      </div>
    </div>
    
    <div class="body">
      <div class="addresses-grid">
        <div class="address-col">
          <h3>Billed From (Seller)</h3>
          <div class="address-details">
            <strong>UserNinjas Technologies Pvt. Ltd.</strong>
            <p>102, Innovation Hub, Phase 2</p>
            <p>HITEC City, Hyderabad</p>
            <p>Telangana - 500081, India</p>
            <p>Email: workside367@gmail.com</p>
          </div>
        </div>
        
        <div class="address-col">
          <h3>Billed To (Buyer)</h3>
          <div class="address-details">
            <strong>${billedToName}</strong>
            ${billedToCompany !== 'N/A' ? '<p>Company: ' + billedToCompany + '</p>' : ''}
            ${billedToLocation !== 'N/A' ? '<p>Location: ' + billedToLocation + '</p>' : ''}
            <p>Email: ${userEmailToDisplay}</p>
            ${billedToPhone !== 'N/A' ? '<p>Phone: ' + billedToPhone + '</p>' : ''}
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Item & Description</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Tax Rate</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-desc">${itemDescription}</div>
                <div class="item-sub">${payment.plan_type ? 'Subscription Plan' : 'Wallet Credits Top-up'}</div>
              </td>
              <td style="text-align: right;">${currencySymbol}${subtotal.toFixed(2)}</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">0%</td>
              <td style="text-align: right;">${currencySymbol}${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="totals-section">
        <div class="totals-box">
          ${taxDetailsHTML}
          <div class="summary-row grand-total">
            <span>Total Paid</span>
            <span>${currencySymbol}${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      <div class="payment-status-banner">
        <span>✔</span>
        <span>Payment ${payment.status.toUpperCase()} — Thank you!</span>
      </div>
    </div>
    
    <div class="footer">
      <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
      <p style="margin-top: 6px;">
        Visit <a href="https://userninjas.in" target="_blank">userninjas.in</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Plan Cards ────────────────────────────────────────────

const PLANS = [
  {
    key: 'per_test' as const,
    name: 'Pay-Per-Test',
    tagline: 'Perfect for occasional researchers',
    price: '₹999',
    period: 'per test',
    priceINR: 999,
    color: 'text-orange-400',
    bg: 'bg-orange-500/8',
    border: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-400/50',
    activeBorder: 'border-orange-400 ring-1 ring-orange-400/30',
    buttonClass: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
    glowColor: 'shadow-orange-500/20',
    icon: Ticket,
    iconBg: 'bg-orange-500/15',
    badge: null,
    features: [
      '1 Custom Research Test',
      'Up to 50 Candidate Invites',
      'Valid for 30 days',
      'Basic reporting dashboard',
      'Standard screener templates',
    ],
  },
  {
    key: 'monthly' as const,
    name: 'Standard',
    tagline: 'For teams running regular testing',
    price: '₹2,999',
    period: '/month',
    priceINR: 2999,
    color: 'text-violet-400',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-400/50',
    activeBorder: 'border-violet-400 ring-1 ring-violet-400/30',
    buttonClass: 'from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600',
    glowColor: 'shadow-violet-500/20',
    icon: Zap,
    iconBg: 'bg-violet-500/15',
    badge: 'Most Popular',
    features: [
      '5 Active Test Links',
      'Up to 200 Invites / month',
      'Standard screener templates',
      'Basic reporting dashboard',
      'Email support',
    ],
  },
  {
    key: 'yearly' as const,
    name: 'Enterprise',
    tagline: 'Unlimited access & priority support',
    price: '₹30,590',
    period: '/year',
    priceINR: 30590,
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-400/50',
    activeBorder: 'border-amber-400 ring-1 ring-amber-400/30',
    buttonClass: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    glowColor: 'shadow-amber-500/20',
    icon: Crown,
    iconBg: 'bg-amber-500/15',
    badge: 'Save 15%',
    features: [
      'Unlimited Active Test Links',
      'Up to 3,000 Invites / year',
      'Advanced analytics & exports',
      'Priority developer support',
      'Custom branding options',
    ],
  },
];

// ─── Main Component ───────────────────────────────────────

export default function RecruiterPaymentsPanel({
  user, profile, onUpgradePlan, onProfileRefresh,
}: RecruiterPaymentsPanelProps) {
  const { toast } = useToast();
  const { subscription, refreshProfile } = useAuth();

  const [tab, setTab] = useState<'overview' | 'plans' | 'history' | 'credits'>('overview');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [studiesUsed, setStudiesUsed] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'per_test' | 'monthly' | 'yearly'>('monthly');

  const planKey = subscription?.plan_type || profile?.plan_type || 'free';
  const planMeta = PLAN_META[planKey] || PLAN_META.free;
  const PlanIcon = planMeta.icon;
  const studyLimit = subscription
    ? (planKey === 'per_test' ? 1 : subscription.active_test_limit)
    : (profile?.study_limit ?? planMeta.studyLimit);

  // ─── Fetch data ───────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setPayments((data as PaymentRecord[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
    } finally { setLoadingPayments(false); }
  }, [user.id]);

  const fetchWallet = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('wallet_balance').eq('user_id', user.id).single();
    if (data && typeof (data as any).wallet_balance === 'number') setWalletBalance((data as any).wallet_balance);
  }, [user.id]);

  const fetchStudiesUsed = useCallback(async () => {
    const { count } = await supabase.from('tests').select('*', { count: 'exact', head: true }).eq('recruiter_id', user.id);
    setStudiesUsed(count ?? 0);
  }, [user.id]);

  useEffect(() => {
    fetchPayments(); fetchWallet(); fetchStudiesUsed();
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
    if (!amount || amount < 10) {
      toast({ title: 'Minimum ₹10', description: 'Please enter at least ₹10.', variant: 'destructive' }); return;
    }
    setProcessingPayment(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast({ title: 'Error', description: 'Razorpay SDK failed to load.', variant: 'destructive' }); return; }

      const apiResponse = await fetch(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'https://www.userninjas.in/api/create-razorpay-order' : '/api/create-razorpay-order',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) }
      );
      if (!apiResponse.ok) { const e = await apiResponse.json(); throw new Error(e.error || 'Failed to initialize payment'); }
      const order = await apiResponse.json();

      const options = {
        key: 'rzp_live_Sx5YIPbX0SGPU4', amount: (amount * 100).toString(), currency: 'INR',
        name: 'User Ninjas', description: 'Wallet Credit Top-up', image: 'https://userninjas.in/logo.png',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await supabase.from('payments').insert({ user_id: user.id, gateway: 'razorpay', amount, currency: 'INR', status: 'successful', plan_type: null, description: `Wallet top-up – ₹${amount.toLocaleString('en-IN')}` });
            await supabase.rpc('increment_wallet_balance', { p_user_id: user.id, p_amount: amount }).then(async ({ error }) => {
              if (error) {
                const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('user_id', user.id).single();
                const current = (prof as any)?.wallet_balance || 0;
                await supabase.from('profiles').update({ wallet_balance: current + amount }).eq('user_id', user.id);
              }
            });
            await fetchWallet(); await fetchPayments();
            toast({ title: `₹${amount.toLocaleString('en-IN')} added!`, description: 'Your wallet has been credited.' });
            setCustomAmount(''); setSelectedPreset(1000);
          } catch (err: any) { toast({ title: 'Error', description: 'Payment succeeded but wallet update failed.', variant: 'destructive' }); }
        },
        prefill: { email: user.email }, theme: { color: '#4f46e5' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: any) => toast({ title: 'Payment Failed', description: r.error.description, variant: 'destructive' }));
      rzp.open();
    } catch (err: any) { toast({ title: 'Error', description: err.message || 'Could not open payment window.', variant: 'destructive' }); }
    finally { setProcessingPayment(false); }
  };

  const processRazorpayPayment = async () => {
    setProcessingPayment(true);
    try {
      const planDetails = {
        per_test:  { name: 'Pay-Per-Test (A La Carte Plan)', priceINR: 999,   days: 30,  testLimit: 1,     inviteLimit: 50   },
        monthly:   { name: 'Monthly Subscription (Standard)', priceINR: 2999,  days: 30,  testLimit: 5,     inviteLimit: 200  },
        yearly:    { name: 'Yearly Subscription (Enterprise)', priceINR: 30590, days: 365, testLimit: 99999, inviteLimit: 3000 }
      }[selectedCheckoutPlan];

      const loaded = await loadRazorpayScript();
      if (!loaded) { toast({ title: 'Error', description: 'Razorpay SDK failed to load.', variant: 'destructive' }); setProcessingPayment(false); return; }

      const apiResponse = await fetch(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'https://www.userninjas.in/api/create-razorpay-order' : '/api/create-razorpay-order',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: planDetails.priceINR }) }
      );
      if (!apiResponse.ok) { const e = await apiResponse.json(); throw new Error(e.error || 'Failed to initialize payment'); }
      const order = await apiResponse.json();

      const options = {
        key: 'rzp_live_Sx5YIPbX0SGPU4', amount: (planDetails.priceINR * 100).toString(), currency: 'INR',
        name: 'User Ninjas', description: `Upgrade to ${planDetails.name}`, image: 'https://userninjas.in/logo.png',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const startDate = new Date(); const endDate = new Date();
            endDate.setDate(startDate.getDate() + planDetails.days);
            await supabase.from('payments').insert({ user_id: user.id, gateway: 'razorpay', amount: planDetails.priceINR, currency: 'INR', status: 'successful', plan_type: selectedCheckoutPlan, description: `Purchased: ${planDetails.name} (${response.razorpay_payment_id})` });
            const { error: subErr } = await supabase.from('subscriptions').upsert({ user_id: user.id, plan_type: selectedCheckoutPlan, payment_status: 'success', start_date: startDate.toISOString(), end_date: endDate.toISOString(), is_valid: true, tests_created: 0, invites_sent: 0, active_test_limit: planDetails.testLimit, invite_limit: planDetails.inviteLimit }, { onConflict: 'user_id' });
            if (subErr) throw subErr;
            await supabase.from('profiles').update({ plan_type: selectedCheckoutPlan, study_limit: planDetails.testLimit, subscription_status: 'active', subscription_end: endDate.toISOString() }).eq('user_id', user.id);
            toast({ title: '🎉 Subscription Activated!', description: `You're now on the ${planDetails.name}.` });
            await refreshProfile(); if (onProfileRefresh) await onProfileRefresh();
            await fetchPayments(); setCheckoutOpen(false);
          } catch (err: any) { toast({ title: 'Update Error', description: err.message || 'Payment recorded but profile update failed.', variant: 'destructive' }); }
          finally { setProcessingPayment(false); }
        },
        prefill: { email: user.email }, theme: { color: '#4f46e5' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        try { await supabase.from('payments').insert({ user_id: user.id, gateway: 'razorpay', amount: planDetails.priceINR, currency: 'INR', status: 'failed', plan_type: selectedCheckoutPlan, description: `Failed: ${planDetails.name} (${response.error.description})` }); } catch (error) { console.error('Error recording payment failure:', error); }
        toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' }); setProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) { toast({ title: 'Error', description: err.message || 'Failed to start payment.', variant: 'destructive' }); setProcessingPayment(false); }
  };

  const exportPaymentHistory = () => {
    const headers = ['Date', 'Description', 'Amount (INR)', 'Status', 'Type', 'Gateway'];
    const rows = payments.map(p => [new Date(p.created_at).toLocaleDateString('en-IN'), (p.description || '').split('|')[0].trim() || (p.plan_type ? `${p.plan_type} Plan` : 'Credit top-up'), p.amount.toString(), p.status, p.plan_type ? 'Subscription' : 'Wallet Credit', p.gateway]);
    downloadCSV(`payments_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Exported', description: `${rows.length} records downloaded.` });
  };

  const downloadInvoice = (payment: PaymentRecord) => {
    const html = generateInvoiceHTML(payment, user.email || '', profile);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.onload = () => { win.print(); };
  };

  const totalSpent = payments.filter(p => p.status === 'successful').reduce((s, p) => s + Number(p.amount), 0);
  const successfulPayments = payments.filter(p => p.status === 'successful').length;

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'plans', label: 'Plans', icon: Sparkles },
    { key: 'credits', label: 'Add Credits', icon: Wallet },
    { key: 'history', label: 'History', icon: Receipt },
  ] as const;

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/8 bg-white/4 w-fit backdrop-blur-sm"
           style={{ background: 'rgba(255,255,255,0.03)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none
                ${active
                  ? 'bg-white/10 text-white shadow-sm shadow-black/20 border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-violet-400' : ''}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* OVERVIEW TAB                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">

          {/* Hero — Current Plan Card */}
          <div className={`relative overflow-hidden rounded-3xl border p-8 bg-gradient-to-br ${planMeta.gradient}`}
               style={{ borderColor: `${planMeta.accentColor}30` }}>
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
                 style={{ background: planMeta.accentColor }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-10"
                 style={{ background: planMeta.accentColor }} />

            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                {/* Plan badge */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${planMeta.bg} border ${planMeta.border} flex items-center justify-center`}>
                    <PlanIcon className={`h-6 w-6 ${planMeta.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Current Plan</p>
                    <h2 className={`text-2xl font-bold ${planMeta.color} leading-none mt-0.5`}>{planMeta.label}</h2>
                  </div>
                  <span className={`ml-2 text-xs font-semibold px-3 py-1 rounded-full border ${
                    subscription?.is_valid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {subscription?.is_valid ? '● Active' : '○ Free'}
                  </span>
                </div>

                <p className="text-slate-400 text-sm max-w-md">{planMeta.description}</p>

                {/* Dates */}
                {subscription && (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Started {new Date(subscription.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      Renews {new Date(subscription.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Wallet balance */}
              <div className="shrink-0 text-right space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Wallet Balance</p>
                <p className="text-4xl font-black text-emerald-400 leading-none">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </p>
                <button
                  onClick={() => setTab('credits')}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-auto transition-colors">
                  Add credits <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Usage meters */}
            {subscription && (
              <div className="relative mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-6"
                   style={{ borderColor: `${planMeta.accentColor}20` }}>
                {planKey !== 'yearly' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> Tests Created
                      </span>
                      <span className="text-white font-bold">{subscription.tests_created} / {subscription.active_test_limit}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (subscription.tests_created / subscription.active_test_limit) * 100)}%`,
                          background: `linear-gradient(90deg, ${planMeta.accentColor}, ${planMeta.accentColor}99)`,
                        }} />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> Candidate Invites
                    </span>
                    <span className="text-white font-bold">
                      {subscription.invites_sent} / {planKey === 'yearly' ? '3,000' : subscription.invite_limit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (subscription.invites_sent / subscription.invite_limit) * 100)}%`,
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                      }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
              { label: 'Transactions', value: successfulPayments, icon: Receipt, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15' },
              { label: 'Studies Created', value: studiesUsed, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
              { label: 'Wallet Balance', value: `₹${walletBalance.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}
                     className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 space-y-3 backdrop-blur-sm`}>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className={`text-2xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity preview */}
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" /> Recent Payments
              </h3>
              <button onClick={() => setTab('history')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {loadingPayments ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-white/4 animate-pulse" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center">
                <Receipt className="h-8 w-8 text-slate-600 mb-3 text-slate-500" />
                <p className="text-sm text-slate-300">No payments yet</p>
                <p className="text-xs text-slate-600 mt-1">Upgrade or add credits to get started</p>
                <button
                  onClick={() => downloadInvoice({
                    id: 'sample-invoice-1234',
                    user_id: user.id,
                    gateway: 'razorpay',
                    amount: 2999,
                    currency: 'INR',
                    status: 'successful',
                    plan_type: 'monthly',
                    description: 'Sample Invoice: Standard Plan Upgrade',
                    created_at: new Date().toISOString()
                  })}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-400 hover:text-violet-300 hover:bg-white/5 transition-all border border-violet-500/20"
                >
                  <Download className="h-3.5 w-3.5" /> Preview Sample Invoice (PDF)
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {payments.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      p.plan_type ? 'bg-violet-500/15' : 'bg-emerald-500/15'
                    }`}>
                      {p.plan_type ? <CreditCard className="h-4 w-4 text-violet-400" /> : <Wallet className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {(p.description || '').split('|')[0].trim() || (p.plan_type ? `${p.plan_type.charAt(0).toUpperCase() + p.plan_type.slice(1)} Plan` : 'Wallet Top-up')}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                      <StatusPill status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          {planKey === 'free' && (
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 p-8"
                 style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(79,70,229,0.08) 100%)' }}>
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl bg-violet-500/20" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-violet-400">Ready to scale your research?</p>
                  <h3 className="text-xl font-bold text-white">Unlock advanced features</h3>
                  <p className="text-sm text-slate-400">Start with Pay-Per-Test or go full Standard/Enterprise</p>
                </div>
                <button onClick={() => setTab('plans')}
                  className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25">
                  View Plans <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PLANS TAB                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" /> Choose Your Plan
            </h2>
            <p className="text-sm text-slate-400 mt-1">Select the plan that best fits your research volume. Upgrade or switch anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(plan => {
              const Icon = plan.icon;
              const isCurrentPlan = planKey === plan.key;
              return (
                <div key={plan.key}
                  className={`relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden group cursor-pointer
                    ${isCurrentPlan ? plan.activeBorder : `${plan.border} ${plan.hoverBorder}`}`}
                  style={{ background: 'rgba(255,255,255,0.025)' }}
                  onClick={() => { if (!isCurrentPlan) { setSelectedCheckoutPlan(plan.key); setCheckoutOpen(true); } }}>

                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                       style={{ background: `radial-gradient(ellipse at top center, ${plan.color.replace('text-', '').includes('violet') ? 'rgba(139,92,246,0.08)' : plan.color.includes('orange') ? 'rgba(249,115,22,0.08)' : 'rgba(245,158,11,0.08)'} 0%, transparent 70%)` }} />

                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        plan.badge === 'Most Popular'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>{plan.badge}</span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">Current</span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-2xl ${plan.iconBg} border ${plan.border} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${plan.color}`} />
                      </div>
                      <div>
                        <p className={`font-bold text-base ${plan.color}`}>{plan.name}</p>
                        <p className="text-xs text-slate-500">{plan.tagline}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white">{plan.price}</span>
                        <span className="text-sm text-slate-500">{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${plan.color}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      disabled={isCurrentPlan}
                      onClick={() => { setSelectedCheckoutPlan(plan.key); setCheckoutOpen(true); }}
                      className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2
                        ${isCurrentPlan
                          ? 'bg-white/8 text-slate-400 cursor-default border border-white/10'
                          : `bg-gradient-to-r ${plan.buttonClass} shadow-lg ${plan.glowColor} shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]`}`}>
                      {isCurrentPlan ? (
                        <><ShieldCheck className="h-4 w-4" /> Current Plan</>
                      ) : (
                        <>Upgrade Now <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-4 border border-white/6 rounded-2xl"
               style={{ background: 'rgba(255,255,255,0.02)' }}>
            {[
              { icon: Shield, label: 'Secure Payments via Razorpay' },
              { icon: Lock, label: 'End-to-End Encrypted' },
              { icon: RefreshCw, label: 'Cancel Anytime' },
              { icon: ShieldCheck, label: 'Data Privacy Compliant' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon className="h-4 w-4 text-slate-600" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CREDITS TAB                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === 'credits' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" /> Add Wallet Credits
            </h2>
            <p className="text-sm text-slate-400 mt-1">Credits fund your tester rewards. Choose an amount or enter a custom value.</p>
          </div>

          {/* Current balance hero */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 p-6"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(5,150,105,0.05) 100%)' }}>
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl bg-emerald-500/20" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Current Balance</p>
                <p className="text-5xl font-black text-emerald-400 mt-1">₹{walletBalance.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-1.5">≈ {Math.floor(walletBalance / 200)} tester rewards available</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Preset amounts */}
          <div>
            <Label className="text-sm font-semibold text-slate-300 mb-4 block">Quick Top-up</Label>
            <div className="grid grid-cols-2 gap-3">
              {CREDIT_PRESETS.map(preset => {
                const selected = selectedPreset === preset.amount && !customAmount;
                return (
                  <button key={preset.amount} onClick={() => { setSelectedPreset(preset.amount); setCustomAmount(''); }}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-200
                      ${selected
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-white/8 bg-white/3 hover:border-emerald-500/40 hover:bg-white/5'}`}>
                    {preset.tag && (
                      <span className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        preset.tag === 'Popular' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>{preset.tag}</span>
                    )}
                    <span className={`text-2xl font-black ${selected ? 'text-emerald-400' : 'text-white'}`}>{preset.label}</span>
                    <span className="text-xs text-slate-500 mt-1">≈ {preset.rewards} tester rewards</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="credit-amount" className="text-sm font-semibold text-slate-300 mb-2 block">Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
              <Input id="credit-amount" type="number" min="10" step="1" placeholder="Enter amount (min ₹10)"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                className="pl-9 h-12 text-base rounded-xl bg-white/4 border-white/12 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20" />
            </div>
          </div>

          {/* Summary + Pay */}
          <div className="rounded-2xl border border-white/8 p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Amount to add</span>
              <span className="text-xl font-black text-white">
                ₹{((customAmount ? parseInt(customAmount) : selectedPreset) || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>New balance after payment</span>
              <span className="text-emerald-400 font-semibold">
                ₹{(walletBalance + ((customAmount ? parseInt(customAmount) : selectedPreset) || 0)).toLocaleString('en-IN')}
              </span>
            </div>
            <Button onClick={handleAddCredits} disabled={processingPayment || (!selectedPreset && !customAmount)}
              className="w-full h-12 text-base font-bold rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100">
              {processingPayment
                ? <><Sparkles className="h-5 w-5 animate-pulse" /> Processing...</>
                : <><Wallet className="h-5 w-5" /> Pay via Razorpay</>}
            </Button>
            <p className="text-center text-xs text-slate-600">
              Supports UPI · Cards · Net Banking · Wallets · Instant credit
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-violet-400" /> Payment History
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{payments.length} transaction{payments.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { fetchPayments(); fetchWallet(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button onClick={exportPaymentHistory} disabled={payments.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all disabled:opacity-40">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {loadingPayments ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-white/4 animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-3xl border border-white/8 py-20 flex flex-col items-center text-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-5">
                <Receipt className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-base font-semibold text-white">No payments yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Your payment history will appear here once you upgrade or add wallet credits.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
                <button onClick={() => setTab('credits')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all">
                  <Wallet className="h-4 w-4" /> Add Credits
                </button>
                <button 
                  onClick={() => downloadInvoice({
                    id: 'sample-invoice-1234',
                    user_id: user.id,
                    gateway: 'razorpay',
                    amount: 2999,
                    currency: 'INR',
                    status: 'successful',
                    plan_type: 'monthly',
                    description: 'Sample Invoice: Standard Plan Upgrade',
                    created_at: new Date().toISOString()
                  })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8 transition-all"
                >
                  <Download className="h-4 w-4 text-violet-400" /> Preview Sample Invoice
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-3 border-b border-white/6"
                   style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-2">Amount</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Invoice</span>
              </div>

              <div className="divide-y divide-white/4">
                {payments.map(p => (
                  <div key={p.id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/3 transition-colors">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.plan_type ? 'bg-violet-500/12 border border-violet-500/20' : 'bg-emerald-500/12 border border-emerald-500/20'}`}>
                      {p.plan_type ? <CreditCard className="h-4 w-4 text-violet-400" /> : <Wallet className="h-4 w-4 text-emerald-400" />}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {(p.description || '').split('|')[0].trim() || (p.plan_type ? `${p.plan_type.charAt(0).toUpperCase() + p.plan_type.slice(1)} Plan` : 'Wallet Top-up')}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.plan_type ? 'text-violet-400 bg-violet-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                          {p.plan_type ? 'Subscription' : 'Credits'}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right pr-2">
                      <span className="text-sm font-bold text-white">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                    </div>

                    {/* Status */}
                    <div><StatusPill status={p.status} /></div>

                    {/* Invoice */}
                    <div className="text-right">
                      {p.status === 'successful' ? (
                        <button onClick={() => downloadInvoice(p)} title="Download Invoice"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all ml-auto">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      ) : <div className="w-8" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Secure Checkout Modal ── */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-3xl border-0 bg-[#0F172A]"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header gradient */}
          <div className="relative overflow-hidden p-7 pb-5"
               style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(79,70,229,0.10) 100%)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl bg-violet-500/20" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">Secure Checkout</DialogTitle>
                <DialogDescription className="text-sm text-slate-400 mt-0.5">
                  Powered by Razorpay · PCI DSS Compliant
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="px-7 py-5 space-y-4">
            {/* Plan summary */}
            <div className="rounded-2xl border border-white/8 p-5 space-y-4"
                 style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Plan</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-base">
                    {PLANS.find(p => p.key === selectedCheckoutPlan)?.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {PLANS.find(p => p.key === selectedCheckoutPlan)?.tagline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-violet-400">
                    {PLANS.find(p => p.key === selectedCheckoutPlan)?.price}
                  </p>
                  <p className="text-xs text-slate-500">
                    {PLANS.find(p => p.key === selectedCheckoutPlan)?.period}
                  </p>
                </div>
              </div>
              <div className="border-t border-white/6 pt-4 space-y-2">
                {PLANS.find(p => p.key === selectedCheckoutPlan)?.features.slice(0, 3).map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-white/6 bg-white/2">
              <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Your payment is secured by Razorpay. Upon clicking proceed, a secure payment window will open to complete the transaction.
              </p>
            </div>
          </div>

          <div className="px-7 pb-7 flex flex-col gap-2">
            <Button onClick={processRazorpayPayment} disabled={processingPayment}
              className="w-full h-12 text-base font-bold rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl disabled:opacity-60">
              {processingPayment
                ? <><Sparkles className="h-5 w-5 animate-pulse" /> Processing...</>
                : <><CreditCard className="h-5 w-5" /> Proceed to Payment <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
            <button onClick={() => setCheckoutOpen(false)} disabled={processingPayment}
              className="w-full h-10 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
