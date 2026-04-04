import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const pricingTiers = [
  {
    name: 'Starter',
    description: 'For small teams getting started with UX research',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '5 user tests per month',
      'Video recordings',
      'Basic analytics',
      '48-hour turnaround',
      'Email support',
      'CSV exports',
      '1 team member',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing teams that need deeper insights',
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      '25 user tests per month',
      'AI-powered insights & summaries',
      'Advanced analytics',
      '24-hour turnaround',
      'Priority support',
      'Custom screener questions',
      'Targeted recruitment',
      'Session recordings',
      'Slack & Jira integrations',
      'Up to 5 team members',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations that need scale & security',
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      'Unlimited user tests',
      'Full AI analytics suite',
      '12-hour turnaround',
      'Dedicated account manager',
      'Custom integrations & API',
      'SSO & advanced security',
      'SLA guarantee',
      'Multi-team workspaces',
      'Unlimited team members',
      'Custom tester panels',
      'White-label reports',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              All plans include a 14-day free trial. No credit card required.
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <span className="ml-2 text-xs text-primary font-semibold">Save 20%</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {pricingTiers.map((tier, index) => (
            <ScrollReveal key={tier.name} animation="fade-up" delay={index * 100}>
              <div
                className={`relative rounded-2xl p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  tier.popular
                    ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]'
                    : 'bg-card border border-border/60 hover:border-primary/25 hover:shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  <p className={`text-sm mt-1 ${tier.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className={`text-sm ${tier.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>/mo</span>
                  </div>
                  {isAnnual && (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      Billed annually (${tier.annualPrice * 12}/yr)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.popular ? 'text-accent' : 'text-primary'}`} />
                      <span className={`text-sm ${tier.popular ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={tier.name === 'Enterprise' ? '/contact' : '/auth'}>
                  <Button
                    className={`w-full rounded-xl gap-2 ${
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
      </div>
    </section>
  );
}
