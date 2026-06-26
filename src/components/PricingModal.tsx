import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, Zap, Building2, Rocket, ArrowRight, X, Phone,
  Crown, Lock, Star, Infinity as InfinityIcon, Ticket, Shield
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/payment.service';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    key: 'per_test',
    name: 'Pay-Per-Test',
    icon: Ticket,
    badge: null,
    description: 'Perfect for one-off custom research.',
    priceINR: 999,
    priceUSD: 15,
    priceLabel: '/ custom test',
    features: [
      '1 Custom Research Test',
      'Max 50 Candidate Invites',
      'Valid for 30 days',
      'Basic reporting dashboard',
    ],
    unavailable: [
      'Advanced analytics & CSV exports',
      'Unlimited active tests',
      'Priority developer support',
    ],
    cta: 'Buy Custom Test',
    ctaDisabled: false,
    popular: false,
    gradient: '',
  },
  {
    key: 'monthly',
    name: 'Monthly Standard',
    icon: Zap,
    badge: '⭐ Recommended',
    description: 'For teams running recurring testing.',
    priceINR: 2999,
    priceUSD: 39,
    priceLabel: '/month',
    features: [
      'Max 5 active tests at a time',
      'Up to 200 invites / month',
      'Standard screener templates',
      'Basic reporting dashboard',
    ],
    unavailable: [
      'Advanced analytics & CSV exports',
      'Priority support',
    ],
    cta: 'Subscribe Monthly',
    ctaDisabled: false,
    popular: true,
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    key: 'yearly',
    name: 'Yearly Enterprise',
    icon: Crown,
    badge: '💎 Save 15%',
    description: 'Unlimited access & priority support.',
    priceINR: 30590,
    priceUSD: 397,
    priceLabel: '/year',
    features: [
      'Unlimited active tests',
      'Up to 3,000 invites / year',
      'Advanced analytics & CSV exports',
      'Priority developer support',
    ],
    unavailable: [],
    cta: 'Subscribe Yearly',
    ctaDisabled: false,
    popular: false,
    gradient: '',
  },
];

export default function PricingModal({ open, onOpenChange, currentPlan = 'free' }: PricingModalProps) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [confirmCheckoutPlan, setConfirmCheckoutPlan] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = (planKey: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to upgrade.", variant: "destructive" });
      return;
    }
    setConfirmCheckoutPlan(planKey);
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const processRazorpayCheckout = async () => {
    if (!user || !confirmCheckoutPlan) return;
    setLoadingPlan(confirmCheckoutPlan);

    try {
      const plan = PLANS.find(p => p.key === confirmCheckoutPlan);
      if (!plan) return;

      const planDetails = {
        per_test: { name: 'Pay-Per-Test (A La Carte Plan)', priceINR: 999, days: 30, testLimit: 1, inviteLimit: 50 },
        monthly: { name: 'Monthly Subscription (Standard Tier)', priceINR: 2999, days: 30, testLimit: 5, inviteLimit: 200 },
        yearly: { name: 'Yearly Subscription (Enterprise/Premium Tier)', priceINR: 30590, days: 365, testLimit: 99999, inviteLimit: 3000 }
      }[confirmCheckoutPlan as 'per_test' | 'monthly' | 'yearly'];

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load.', variant: 'destructive' });
        setLoadingPlan(null);
        return;
      }

      // Generate Order ID via backend Express server
      const order = await paymentService.createOrder(confirmCheckoutPlan as 'per_test' | 'monthly' | 'yearly');

      const amount = plan.priceINR * 100; // in paise
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Sx5YIPbX0SGPU4',
        amount: amount.toString(),
        currency: 'INR',
        name: 'User Ninjas',
        description: `Upgrade to ${plan.name} Plan`,
        image: 'https://userninjas.in/logo.png',
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify signature securely on Express backend
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({ title: 'Upgrade Successful!', description: `You have successfully upgraded to the ${plan.name} plan.` });
            await refreshProfile();
            setConfirmCheckoutPlan(null);
            onOpenChange(false);
          } catch (err: any) {
            console.error('Error verifying payment on server:', err);
            toast({ title: 'Verification Failed', description: err.message || 'Payment verification failed. Contact support.', variant: 'destructive' });
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#4f46e5', // indigo-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast({ title: 'Payment Failed', description: response.error.description || 'Transaction cancelled', variant: 'destructive' });
        setLoadingPlan(null);
      });
      paymentObject.open();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error upgrading profile', description: err.message || 'Failed to update subscription.', variant: 'destructive' });
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden border border-border/60 shadow-2xl shadow-black/30 rounded-2xl bg-card">
        {confirmCheckoutPlan ? (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-bold font-display">Secure Payment Checkout</h3>
                <p className="text-xs text-muted-foreground">Confirm your plan details and proceed to secure checkout.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Selected Tier</p>
              <h4 className="font-bold text-sm text-foreground">
                {PLANS.find(p => p.key === confirmCheckoutPlan)?.name}
              </h4>
              <p className="text-lg font-extrabold text-primary font-display mt-2">
                {currency === 'INR' 
                  ? `₹${PLANS.find(p => p.key === confirmCheckoutPlan)?.priceINR?.toLocaleString('en-IN')}`
                  : `$${PLANS.find(p => p.key === confirmCheckoutPlan)?.priceUSD}`
                }
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setConfirmCheckoutPlan(null)} disabled={loadingPlan !== null} className="h-9 text-xs">
                Cancel
              </Button>
              <Button 
                onClick={processRazorpayCheckout} 
                disabled={loadingPlan !== null} 
                className="h-9 text-xs bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold"
              >
                {loadingPlan !== null ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/5 to-background border-b border-border/60 px-8 pt-8 pb-6">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-display">Upgrade your plan</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                You've reached the free plan limit. Unlock more to keep publishing research.
              </DialogDescription>
            </div>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Currency:</span>
            <div className="inline-flex rounded-lg bg-secondary/70 p-0.5 gap-0.5">
              {(['INR', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.key === currentPlan;
            const price = currency === 'INR' ? plan.priceINR : plan.priceUSD;
            const currencySymbol = currency === 'INR' ? '₹' : '$';

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-primary/5 to-purple-500/5'
                    : 'bg-card'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                    plan.popular ? 'bg-primary/15' : 'bg-secondary/70'
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold font-display">{plan.name}</h3>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-display">
                        {price === 0 ? 'Free' : `${currencySymbol}${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-muted-foreground">{plan.priceLabel}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Contact Sales</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.unavailable.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground/60 line-through">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  disabled={plan.ctaDisabled || isCurrent || loadingPlan === plan.key}
                  onClick={() => handleUpgrade(plan.key)}
                  className={`w-full rounded-xl gap-2 font-semibold h-10 text-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.key === 'enterprise' ? (
                    <>Contact Sales <ArrowRight className="h-3.5 w-3.5" /></>
                  ) : isCurrent ? (
                    <>
                      <Star className="h-3.5 w-3.5" /> Your Plan
                    </>
                  ) : (
                    <>
                      {loadingPlan === plan.key ? (
                        <Zap className="h-3.5 w-3.5 animate-pulse" /> 
                      ) : (
                        plan.popular && <InfinityIcon className="h-3.5 w-3.5" />
                      )}
                      {loadingPlan === plan.key ? 'Processing...' : plan.cta}
                      {!plan.popular && !loadingPlan && <ArrowRight className="h-3.5 w-3.5" />}
                    </>
                  )}
                </Button>

                {plan.key === 'monthly' && (
                  <p className="text-center text-[10px] text-muted-foreground mt-2">
                    Supports UPI · Cards · Wallets · Auto-renew
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="px-8 py-4 border-t border-border/60 bg-secondary/20 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Payments are secured by Razorpay &amp; Stripe · GST invoice included · Cancel anytime
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Maybe later
          </button>
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
