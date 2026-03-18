import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Trusted by 4,000+ product teams worldwide
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[0.95]">
              User research
              <br />
              at <span className="text-gradient">warp speed</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={350}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Access 120,000+ verified testers from 150+ countries. Get actionable insights
              in hours, not weeks. Ship products people actually love.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={500}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl gap-2 border-border/60">
                  <Play className="h-4 w-4" />
                  See How It Works
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={650}>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · SOC2 Certified · 14-day free trial
            </p>
          </ScrollReveal>

          {/* Stats bar */}
          <ScrollReveal animation="fade-up" delay={800}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: '120K+', label: 'Verified Testers' },
                { value: '150+', label: 'Countries' },
                { value: '24h', label: 'Avg Turnaround' },
                { value: '99.9%', label: 'Uptime SLA' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
