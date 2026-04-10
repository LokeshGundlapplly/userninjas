import { useState } from 'react';
import { Check, ArrowRight, Zap, Building2, Rocket, Shield, Lock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const tiers = [
  {
    name: 'Starter',
    icon: Rocket,
    description: 'Perfect for solo researchers and small teams starting their UX journey.',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '5 unmoderated tests / month',
      'Figma & URL prototype testing',
      'HD screen + audio recording',
      '5-second tests & surveys',
      'Basic analytics dashboard',
      '48-hour turnaround',
      '2 team members',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
    accentColor: 'text-accent',
    iconBg: 'bg-accent/10',
    badgeColor: '',
  },
  {
    name: 'Pro',
    icon: Zap,
    description: 'For growing teams who need deep insights, AI analysis, and faster results.',
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      '25 tests / month',
      'All Starter features',
      'AI insights & auto-summaries',
      'Card sorting & tree testing',
      'Click testing & heatmaps',
      'Advanced analytics & clips',
      'Smart screener questions',
      'Global panel recruitment',
      '24-hour turnaround',
      'Slack, Jira & Figma integrations',
      'Up to 10 team members',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: true,
    accentColor: 'text-primary-foreground',
    iconBg: 'bg-primary-foreground/15',
    badgeColor: 'bg-accent text-accent-foreground',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    description: 'For organizations that need scale, compliance, and a dedicated research partner.',
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      'Unlimited tests',
      'All Pro features',
      'Longitudinal & diary studies',
      'Custom panel recruitment',
      'Moderated interview scheduling',
      '12-hour turnaround',
      'Full AI analytics suite',
      'Custom API & webhooks',
      'SSO / SAML & advanced security',
      'SOC 2 Type II & GDPR reports',
      'Unlimited team members',
      'Dedicated account manager + SLA',
    ],
    cta: 'Contact Sales',
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
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28 bg-secondary/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-3">
              Teams that run research with User Ninjas ship products 2× faster. Start free, scale as you grow.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              14-day free trial on all plans · No credit card required
            </p>

            <div className="inline-flex items-center p-1.5 rounded-xl bg-card border border-border/50 shadow-sm gap-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isAnnual ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isAnnual ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {tiers.map((tier, index) => (
            <ScrollReveal key={tier.name} animation="fade-up" delay={index * 100}>
              <div
                className={`relative rounded-2xl p-7 h-full flex flex-col transition-all duration-300 ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/25 gradient-border scale-[1.02]'
                    : 'bg-card border border-border/50 hover:border-primary/20 hover:shadow-xl spring-card'
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
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className={`text-sm ${tier.popular ? 'text-primary-foreground/55' : 'text-muted-foreground'}`}>/mo</span>
                  </div>
                  {isAnnual ? (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      ${tier.annualPrice * 12}/year — save ${(tier.monthlyPrice - tier.annualPrice) * 12}
                    </p>
                  ) : (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      or ${tier.annualPrice}/mo billed annually
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
                </ul>

                <Link to={tier.name === 'Enterprise' ? '/contact' : '/auth'}>
                  <Button
                    className={`w-full rounded-xl gap-2 font-semibold h-11 ${
                      tier.popular
                        ? 'bg-background text-foreground hover:bg-background/90 shadow-lg'
                        : tier.name === 'Enterprise'
                        ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                {tier.name === 'Enterprise' && (
                  <p className={`text-center text-xs mt-3 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                    Custom pricing available
                  </p>
                )}
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
              All plans include a 14-day free trial ·{' '}
              <Link to="/contact" className="text-primary hover:underline">Need a custom plan?</Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
