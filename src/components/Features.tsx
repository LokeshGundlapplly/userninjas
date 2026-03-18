import { Search, Target, Shield, Zap, BarChart3, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Search,
    title: 'Sentiment AI',
    description: 'Our AI analyzes facial expressions and voice tone to generate automated sentiment scores for every session.',
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Filter by job title, income, device, or specific software skills. Get the exact users you need.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 Type II compliant with built-in NDA management. Your prototypes stay protected.',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Get results in hours, not weeks. Our streamlined process delivers insights at record speed.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'AI-powered insights extraction with automatic tagging, clips, and highlight reels.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Test in any language, timezone, or market. True global coverage for international products.',
  },
];

export default function Features() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Capabilities</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything you need to ship<br />products people love
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete toolkit for modern product research teams.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 80}>
              <div className="group p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
