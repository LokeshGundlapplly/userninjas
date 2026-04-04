import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Video, BarChart3, Users, Sparkles, Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Main dashboard card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-secondary/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-secondary text-xs text-muted-foreground">dashboard.userninjas.com</div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active Tests', value: '12', icon: Video, color: 'text-primary' },
              { label: 'Responses', value: '847', icon: BarChart3, color: 'text-accent' },
              { label: 'Avg. Rating', value: '4.8', icon: Star, color: 'text-warning' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-secondary/60 p-3">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                <p className="font-display text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent session */}
          <div className="rounded-xl border border-border/40 p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold">Recent Sessions</p>
              <span className="text-[10px] text-primary font-medium">View All →</span>
            </div>
            {[
              { name: 'Sarah M.', task: 'Checkout Flow Test', time: '12m ago', sentiment: 'Positive' },
              { name: 'James K.', task: 'Onboarding UX Review', time: '34m ago', sentiment: 'Neutral' },
            ].map((session) => (
              <div key={session.name} className="flex items-center gap-3 py-2 border-t border-border/30">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{session.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{session.task}</p>
                  <p className="text-[10px] text-muted-foreground">{session.name} · {session.time}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  session.sentiment === 'Positive' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'
                }`}>
                  {session.sentiment}
                </span>
              </div>
            ))}
          </div>

          {/* AI insights bar */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">AI Insight Generated</p>
              <p className="text-[10px] text-muted-foreground">3 pain points detected in checkout flow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-float">
        ✨ AI Powered
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium text-primary mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Trusted by 500+ companies worldwide
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                Test your product with real users.{' '}
                <span className="text-gradient">Get insights in hours.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={350}>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                The fastest, most affordable way to get real user feedback. Launch tests in minutes, 
                get video recordings, AI-powered insights, and actionable data to ship better products.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={500}>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/25">
                    Start Testing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl gap-2 border-border/60">
                    <Play className="h-4 w-4" />
                    Book a Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required · Setup in 2 minutes · Cancel anytime
              </p>
            </ScrollReveal>

            {/* Social proof stats */}
            <ScrollReveal animation="fade-up" delay={650}>
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-border/40">
                {[
                  { value: '10,000+', label: 'Tests Completed' },
                  { value: '500+', label: 'Companies Trust Us' },
                  { value: '24h', label: 'Avg. Turnaround' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right - Dashboard mockup */}
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
