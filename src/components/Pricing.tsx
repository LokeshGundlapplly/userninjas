import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ScrollReveal from './ScrollReveal';

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '5 user tests per month',
      'Access to 10,000+ testers',
      'Basic analytics dashboard',
      '48-hour turnaround',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power',
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      '25 user tests per month',
      'Access to 50,000+ testers',
      'Advanced analytics & heatmaps',
      '24-hour turnaround',
      'Priority support',
      'Custom screening criteria',
      'Video recordings',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with advanced needs',
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      'Unlimited user tests',
      'Access to 120,000+ testers',
      'Full analytics suite',
      '12-hour turnaround',
      'Dedicated account manager',
      'Custom integrations',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Choose the plan that fits your research needs. All plans include a 14-day free trial.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <span className="ml-2 text-xs text-primary font-semibold">Save 20%</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <ScrollReveal key={tier.name} animation="fade-up" delay={index * 0.1}>
              <Card 
                className={`relative h-full flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                  tier.popular 
                    ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-display">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually (${tier.annualPrice * 12}/year)
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
