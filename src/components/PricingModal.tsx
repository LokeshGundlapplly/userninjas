import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, Zap, Building2, Rocket, ArrowRight, X, Phone,
  Crown, Lock, Star, Infinity
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    key: 'free',
    name: 'Free',
    icon: Rocket,
    badge: null,
    description: 'Get started with research basics.',
    priceINR: 0,
    priceUSD: 0,
    priceLabel: 'Free forever',
    features: [
      '2 published studies lifetime',
      '25 participant responses / study',
      'Basic analytics only',
      'Dynamic screener forms',
      'Community support',
    ],
    unavailable: [
      'AI screener suggestions',
      'CSV export',
      'Priority support',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
    popular: false,
    gradient: '',
  },
  {
    key: 'pro',
    name: 'Pro',
    icon: Zap,
    badge: '⭐ Most Popular',
    description: 'For serious researchers and growing teams.',
    priceINR: 2999,
    priceUSD: 39,
    priceLabel: '/month',
    features: [
      '25 active studies / month',
      '2,000 responses / month',
      'AI screener suggestions',
      'Advanced analytics',
      'CSV export',
      'Priority support',
      'Dynamic screener forms',
      'Conditional logic',
    ],
    unavailable: [],
    cta: 'Upgrade to Pro',
    ctaDisabled: false,
    popular: true,
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    badge: null,
    description: 'Custom solutions for large organizations.',
    priceINR: null,
    priceUSD: null,
    priceLabel: 'Contact Sales',
    features: [
      'Unlimited studies',
      'Unlimited responses',
      'Team workspace',
      'API access',
      'SSO / SAML',
      'Audit logs',
      'Dedicated support',
      'Custom onboarding',
    ],
    unavailable: [],
    cta: 'Contact Sales',
    ctaDisabled: false,
    popular: false,
    gradient: '',
  },
];

export default function PricingModal({ open, onOpenChange, currentPlan = 'free' }: PricingModalProps) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planKey: string) => {
    if (planKey === 'enterprise') {
      window.open('mailto:sales@userninjas.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to upgrade.", variant: "destructive" });
      return;
    }

    setLoadingPlan(planKey);
    const plan = PLANS.find(p => p.key === planKey);
    if (!plan) return;

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast({ title: "Error", description: "Razorpay SDK failed to load. Are you online?", variant: "destructive" });
        return;
      }

      const amount = plan.priceINR * 100; // paise
      const options = {
        key: "rzp_live_SpbXv82kpMslCk", 
        amount: amount.toString(),
        currency: "INR",
        name: "User Ninjas",
        description: `Upgrade to ${plan.name} Plan`,
        image: "https://userninjas.com/logo.png",
        handler: async function (response: any) {
          try {
            // Update profile
            await supabase.from('profiles').update({ 
              plan_type: plan.key, 
              study_limit: plan.key === 'pro' ? 25 : 9999 
            }).eq('user_id', user.id);
            
            // Insert payment record
            await supabase.from('payments').insert({
              user_id: user.id, 
              gateway: 'razorpay', 
              amount: plan.priceINR, 
              currency: 'INR', 
              status: 'successful', 
              plan_type: plan.key
            });

            await refreshProfile();
            toast({ title: "Payment successful!", description: `You have successfully upgraded to the ${plan.name} plan.` });
            onOpenChange(false);
          } catch (err: any) {
             console.error("Error updating profile:", err);
             toast({ title: "Setup incomplete", description: "Payment succeeded but profile update failed. Contact support.", variant: "destructive" });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#4f46e5", // indigo-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
      });
      paymentObject.open();

    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to initialize payment", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden border border-border/60 shadow-2xl shadow-black/30 rounded-2xl bg-card">
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
                        plan.popular && <Infinity className="h-3.5 w-3.5" />
                      )}
                      {loadingPlan === plan.key ? 'Processing...' : plan.cta}
                      {!plan.popular && !loadingPlan && <ArrowRight className="h-3.5 w-3.5" />}
                    </>
                  )}
                </Button>

                {plan.key === 'pro' && (
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
            Payments are secured by Razorpay & Stripe · GST invoice included · Cancel anytime
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
