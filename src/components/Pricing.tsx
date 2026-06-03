import { useState } from 'react';
import { Check, ArrowRight, Zap, Building2, Rocket, Shield, Lock, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const tiers = [
  {
    name: 'Pay-Per-Test',
    icon: Rocket,
    description: 'Perfect for one-off custom research.',
    priceINR: 999,
    priceUSD: 15,
    priceLabel: 'one-time fee',
    features: [
      '1 Custom Research Test',
      'Max 50 Candidate Invites',
      'Valid for 30 days',
      'Basic reporting dashboard',
      'Figma & URL prototype testing',
    ],
    unavailable: [
      'Advanced analytics & CSV exports',
      'AI-moderated Interviews',
      'Custom Surveys & logic',
      'Unlimited active tests',
    ],
    cta: 'Buy Custom Test',
    popular: false,
    accentColor: 'text-accent',
    iconBg: 'bg-accent/10',
    badgeColor: '',
  },
  {
    name: 'Monthly Standard',
    icon: Zap,
    description: 'For teams running recurring testing.',
    priceINR: 2999,
    priceUSD: 39,
    priceLabel: '/month',
    features: [
      'Max 5 active tests at a time',
      'Up to 200 invites / month',
      'Max 3 AI-moderated Interviews',
      'Max 3 active Surveys',
      'Standard screener templates',
      'Basic reporting dashboard',
    ],
    unavailable: [
      'Advanced analytics & CSV exports',
      'Priority developer support',
    ],
    cta: 'Subscribe Monthly',
    popular: true,
    accentColor: 'text-primary-foreground',
    iconBg: 'bg-primary-foreground/15',
    badgeColor: 'bg-accent text-accent-foreground',
  },
  {
    name: 'Yearly Enterprise',
    icon: Crown,
    description: 'Unlimited access & priority support.',
    priceINR: 30590,
    priceUSD: 397,
    priceLabel: '/year',
    features: [
      'Unlimited active tests',
      'Up to 3,000 invites / year',
      'Unlimited AI Interviews & Surveys',
      'Full AI Insights & Sentiment Analysis',
      'Advanced analytics & CSV exports',
      'Priority developer support',
    ],
    unavailable: [],
    cta: 'Subscribe Yearly',
    popular: false,
    accentColor: 'text-primary',
    iconBg: 'bg-primary/10',
    badgeColor: '',
  },
];

const trustBadges = [
  { icon: Shield, label: 'SOC 2 Type II' },
  { icon: Lock, label: 'GDPR Compliant' },
  { icon: Award, label: 'G2 Leader 2026' },
];

export default function Pricing() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <section id="pricing" className="py-28 bg-secondary/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Simple, <span className="text-gradient">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-3">
              Teams that run research with User Ninjas ship products 2× faster. Start free, scale as you grow.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Choose your payment currency below to view local pricing.
            </p>

            <div className="inline-flex items-center p-1.5 rounded-xl bg-card border border-border/50 shadow-sm gap-1 backdrop-blur-sm">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  currency === 'INR' ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  currency === 'USD' ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🌐 USD ($)
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {tiers.map((tier, index) => (
            <ScrollReveal key={tier.name} animation="fade-up" delay={index * 100} className="h-full">
              <div
                className={`relative rounded-2xl p-7 h-full flex flex-col transition-all duration-300 ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/25 gradient-border scale-[1.02]'
                    : 'bg-card border border-border/50 hover:border-primary/20 hover:shadow-xl lift-glow spotlight-card'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[11px] font-bold px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      ⭐ Most Popular — Best Value
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl ${tier.iconBg} flex items-center justify-center mb-4`}>
                    <tier.icon className={`w-5 h-5 ${tier.accentColor}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${tier.popular ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold">
                      {currency === 'INR' ? '₹' : '$'}
                      {currency === 'INR' ? tier.priceINR.toLocaleString('en-IN') : tier.priceUSD}
                    </span>
                    <span className={`text-sm ${tier.popular ? 'text-primary-foreground/55' : 'text-muted-foreground'}`}>
                      {tier.priceLabel}
                    </span>
                  </div>
                  {currency === 'INR' ? (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      GST invoice included
                    </p>
                  ) : (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      Billed internationally
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-7">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${
                        tier.popular ? 'bg-primary-foreground/20' : 'bg-primary/10'
                      }`}>
                        <Check className={`h-2.5 w-2.5 ${tier.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      <span className={`text-sm ${tier.popular ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {tier.unavailable.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center bg-muted/40">
                        <span className="text-[8px] font-bold">×</span>
                      </div>
                      <span className={`text-sm line-through ${tier.popular ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={tier.name === 'Enterprise' ? '/contact' : '/auth'}>
                  <Button
                    className={`w-full rounded-xl gap-2 font-semibold h-11 btn-magnetic ${
                      tier.popular
                        ? 'bg-background text-foreground hover:bg-background/90 shadow-lg'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust & compliance row */}
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 p-5 rounded-2xl bg-card border border-border/50">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
            <span className="hidden sm:block text-border">|</span>
            <p className="text-xs text-muted-foreground">
              Payments secured by Razorpay & Stripe ·{' '}
              <Link to="/contact" className="text-primary hover:underline">Need custom enterprise agreements?</Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
