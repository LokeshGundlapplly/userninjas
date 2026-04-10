import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const tiers = [
  {
    name: 'Starter',
    description: 'For small teams getting started',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '5 user tests / month',
      'Video recordings',
      'Basic analytics',
      '48-hour turnaround',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For teams that need deeper insights',
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      '25 user tests / month',
      'AI insights & summaries',
      'Advanced analytics',
      '24-hour turnaround',
      'Priority support',
      'Custom screener questions',
      'Targeted recruitment',
      'Slack & Jira integrations',
      'Up to 5 team members',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For orgs that need scale & security',
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
      'Unlimited team members',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              14-day free trial on all plans. No credit card required.
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual <span className="text-xs text-primary font-semibold ml-1">Save 20%</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier, index) => (
            <ScrollReveal key={tier.name} animation="fade-up" delay={index * 100}>
              <div
                className={`relative rounded-2xl p-6 h-full flex flex-col transition-all duration-300 ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-2 ring-primary/30'
                    : 'bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[11px] font-bold px-4 py-1 rounded-full shadow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-display text-lg font-bold">{tier.name}</h3>
                  <p className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className={`text-sm ${tier.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>/mo</span>
                  </div>
                  {isAnnual && (
                    <p className={`text-[11px] mt-1 ${tier.popular ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      Billed annually (${tier.annualPrice * 12}/yr)
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.popular ? 'text-accent' : 'text-primary'}`} />
                      <span className={`text-sm ${tier.popular ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={tier.name === 'Enterprise' ? '/contact' : '/auth'}>
                  <Button
                    className={`w-full rounded-xl gap-2 ${
                      tier.popular
                        ? 'bg-background text-foreground hover:bg-background/90'
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
