import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap, Crown, Ticket, ShieldCheck, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const PLANS = [
  {
    key: 'per_test',
    name: 'Pay-Per-Test',
    tagline: 'Ideal for single research runs.',
    price: '₹999',
    period: 'one-time',
    icon: Ticket,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    popular: false,
    cta: 'Select Single Test',
    features: [
      '1 Custom Usability/Research Test',
      'Up to 50 Candidate Invites',
      'Figma & URL prototype testing',
      'Basic analytics dashboard',
      '30 days access to results',
    ],
  },
  {
    key: 'monthly',
    name: 'Standard',
    tagline: 'Perfect for scaling product teams.',
    price: '₹2,999',
    period: 'month',
    icon: Zap,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    popular: true,
    cta: 'Subscribe Monthly',
    features: [
      '5 Active Test Links',
      'Up to 200 Invites / month',
      'Max 3 AI-moderated Interviews',
      'Max 3 active Surveys',
      'Advanced screener logic templates',
      'Interactive dashboard & reports',
      'Email support',
    ],
  },
  {
    key: 'yearly',
    name: 'Enterprise',
    tagline: 'Full quantitative research operating system.',
    price: '₹30,590',
    period: 'year',
    icon: Crown,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    popular: false,
    cta: 'Subscribe Yearly (Save 15%)',
    features: [
      'Unlimited Active Test Links',
      'Up to 3,000 Invites / year',
      'Unlimited AI-moderated Interviews',
      'Unlimited active Surveys',
      'Advanced analytics & CSV exports',
      'Custom branding & screener config',
      'Priority developer support',
    ],
  },
];

export default function PricingPage() {
  const { user, profile, subscription } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const activePlan = subscription?.plan_name || profile?.plan_type || 'free';

  const handlePlanSelect = (planKey: string) => {
    if (!user) {
      navigate('/auth?redirect=/pricing');
      return;
    }
    navigate(`/checkout?plan=${planKey}`);
  };

  return (
    <>
      <Background3D />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4">
        <PageTransition>
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                Simple Plans, Maximum Value
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mt-4 mb-6">
                Pricing designed for <span className="text-gradient font-extrabold">UX Builders</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Connect with qualified testers, run automated interviews, and transform qualitative session transcripts into quantitative insights in minutes.
              </p>
              
              {/* Currency Toggle */}
              <div className="inline-flex rounded-xl bg-card border border-border p-1 shadow-sm gap-1">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'INR' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🇮🇳 INR (₹)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'USD' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🌐 USD ($)
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6 items-stretch mb-20">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = plan.key === activePlan;
                const priceLabel = currency === 'INR' 
                  ? plan.price 
                  : plan.key === 'per_test' ? '$15' : plan.key === 'monthly' ? '$39' : '$397';

                return (
                  <div
                    key={plan.key}
                    className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-b from-primary/10 via-purple-500/5 to-card border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.03]'
                        : 'bg-card border border-border hover:border-primary/20 shadow-lg spotlight-card'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-violet-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}

                    {/* Icon & Title */}
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        {plan.name}
                        {isCurrent && (
                          <span className="text-[10px] bg-secondary text-secondary-foreground border px-2 py-0.5 rounded-full font-semibold uppercase">
                            Active
                          </span>
                        )}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">{plan.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 border-b border-border/60 pb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold text-foreground">
                          {priceLabel}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          / {plan.period}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {currency === 'INR' ? 'GST Invoice Included' : 'Billed Internationally'}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 flex-1 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <Button
                      disabled={isCurrent}
                      onClick={() => handlePlanSelect(plan.key)}
                      className={`w-full rounded-xl gap-2 font-bold h-11 transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary to-indigo-600 text-white hover:from-primary/95 hover:to-indigo-600/95 shadow-md shadow-primary/20'
                          : 'bg-secondary text-foreground hover:bg-secondary/80 border'
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {isCurrent ? 'Current Active Plan' : plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="font-semibold text-sm">Enterprise-grade Security Standards</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>✓ SOC 2 Compliant</span>
                <span>✓ GDPR Compliant</span>
                <span>✓ End-to-End SSL Enforced</span>
                <span>✓ Automated Signature Validation</span>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
