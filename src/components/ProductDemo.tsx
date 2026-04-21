import { Play, MousePointerClick, BarChart3, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    number: '01',
    title: 'Upload your prototype',
    description: 'Paste a Figma link, live URL, or upload screens — we handle the rest.',
    icon: MousePointerClick,
  },
  {
    number: '02',
    title: 'Watch real users interact',
    description: 'HD recordings with voice, clicks, and frustration signals — all timestamped.',
    icon: Play,
  },
  {
    number: '03',
    title: 'Get AI-powered insights',
    description: 'Pain points, sentiment analysis, and prioritized recommendations in minutes.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Ship with confidence',
    description: 'Data-backed decisions that align your team and accelerate your roadmap.',
    icon: BarChart3,
  },
];

export default function ProductDemo() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent dark:via-primary/[0.04]" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">
              See it in action
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              From idea to insight in <span className="text-gradient">minutes</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Watch how product teams use User Ninjas to validate decisions, uncover friction, and ship better products — faster than ever.
            </p>
          </div>
        </ScrollReveal>

        {/* Video Player Mockup */}
        <ScrollReveal animation="scale" delay={100}>
          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group hover:shadow-primary/10 transition-shadow duration-500">
              {/* Video placeholder with gradient */}
              <div className="aspect-video bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.08] dark:from-card dark:to-card/80 relative flex items-center justify-center">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />

                {/* Play button */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 right-4 bg-foreground/80 dark:bg-background/80 text-background dark:text-foreground text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  2:14
                </div>

                {/* Floating UI elements for visual interest */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-card/90 border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-medium text-foreground">Live Session</span>
                </div>

                <div className="absolute top-6 right-6 bg-card/90 border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
                  <span className="text-xs font-medium text-accent">AI Analysis Active</span>
                </div>

                {/* Bottom progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
                  <div className="h-full w-[65%] bg-primary rounded-r-full" />
                </div>
              </div>
            </div>

            {/* Caption below video */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              See how a 10-minute usability test reveals critical UX issues your team never noticed.
            </p>
          </div>
        </ScrollReveal>

        {/* Walkthrough Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} animation="fade-up" delay={index * 100}>
                <div className="relative group">
                  {/* Connector line (hidden on last item & mobile) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(100%+0.25rem)] w-[calc(100%-2rem)] h-px border-t border-dashed border-border" />
                  )}

                  <div className="p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/20 hover:bg-card transition-all duration-300 lift-glow spotlight-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Bottom CTA */}
          <ScrollReveal animation="fade-up" delay={500}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link to="/auth">
                <Button size="lg" className="rounded-xl px-8 h-12 text-base font-semibold gap-2">
                  Try It Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                No credit card required · Setup in under 5 minutes
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
