import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <ScrollReveal animation="fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-semibold text-primary mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Trusted by 500+ product teams
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={100}>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6">
                User testing that{' '}
                <span className="text-gradient">moves fast</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Get video recordings, AI-powered insights, and real user feedback in hours — not weeks. 
                The research platform built for modern product teams.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl gap-2 border-border/60 w-full sm:w-auto">
                    <Play className="h-4 w-4" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {['No credit card required', '14-day free trial', 'Cancel anytime'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-accent" />
                    {item}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right — Dashboard mockup */}
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-secondary/40">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 rounded-md bg-secondary/80 max-w-[200px] mx-auto" />
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tests Run', value: '1,284' },
                      { label: 'Avg. Rating', value: '4.9' },
                      { label: 'Turnaround', value: '24h' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-secondary/50 border border-border/30 p-3 text-center">
                        <p className="font-display text-lg font-bold">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-xl bg-secondary/30 border border-border/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold">Test Completion Rate</span>
                      <span className="text-xs text-accent font-semibold">+12.5%</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 55, 45, 65, 50, 75, 60, 80, 70, 85, 78, 92].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/20"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sessions list */}
                  <div className="space-y-2">
                    {[
                      { name: 'Anna S.', task: 'Checkout flow', sentiment: 'Positive' },
                      { name: 'Mike R.', task: 'Onboarding', sentiment: 'Neutral' },
                    ].map((session) => (
                      <div key={session.name} className="flex items-center gap-3 rounded-lg bg-secondary/30 border border-border/20 p-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{session.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{session.name}</p>
                          <p className="text-[10px] text-muted-foreground">{session.task}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          session.sentiment === 'Positive' 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-muted text-muted-foreground'
                        }`}>{session.sentiment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Stats bar */}
        <ScrollReveal animation="fade-up" delay={600}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border/40">
            {[
              { value: '10,000+', label: 'Tests Completed' },
              { value: '500+', label: 'Companies' },
              { value: '24h', label: 'Avg. Turnaround' },
              { value: '4.9/5', label: 'Customer Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
