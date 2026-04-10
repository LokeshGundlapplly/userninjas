import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star, TrendingUp, Users, Zap, Shield } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const awards = [
  { label: 'G2 Leader', sub: 'Spring 2026' },
  { label: '4.9 / 5', sub: '600+ reviews' },
  { label: '#1 UX Research', sub: 'Product Hunt 2026' },
];

const heroStats = [
  { value: '120K+', label: 'Vetted Testers', icon: Users },
  { value: '<24h', label: 'Avg. Results', icon: Zap },
  { value: '500+', label: 'Product Teams', icon: Shield },
  { value: '98%', label: 'Satisfaction', icon: Star },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/4 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-xs font-semibold text-primary mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Trusted by 500+ product teams · Now with AI-powered analysis
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={80}>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Understand your users.{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient">Ship better products.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={160}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Run moderated and unmoderated user research with 120,000+ vetted testers worldwide.
              Get AI-powered insights, session recordings, and actionable reports — in hours, not weeks.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link to="/auth">
                <Button size="lg" className="btn-shimmer bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-semibold rounded-xl gap-2 shadow-xl shadow-primary/25 w-full sm:w-auto">
                  Start for Free — No Credit Card
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base font-semibold rounded-xl gap-2 border-border/60 w-full sm:w-auto hover:bg-secondary/60">
                  <Play className="h-4 w-4 fill-current" />
                  Watch 2-min Demo
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-10">
              {['Free forever plan', 'Results in 24h', 'Cancel anytime'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-accent" />
                  {item}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              {awards.map((a, i) => (
                <div key={a.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border/50 shadow-sm hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-none">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={340}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-16">
              {heroStats.map((stat, i) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="font-display text-xl font-extrabold text-primary stat-number">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard mockup */}
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl pointer-events-none" />
            <div className="relative rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 h-6 px-4 rounded-full bg-secondary/80 text-xs text-muted-foreground w-48">
                    <span className="w-2 h-2 rounded-full bg-accent/70 shrink-0" />
                    app.userninjas.com
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-50">
                  <div className="w-16 h-5 rounded-full bg-border/60" />
                  <div className="w-8 h-5 rounded-full bg-primary/30" />
                </div>
              </div>

              <div className="p-5 md:p-7 grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base">Active Research Tests</h3>
                      <p className="text-xs text-muted-foreground">4 of 6 tests complete</p>
                    </div>
                    <span className="stat-pill">
                      <TrendingUp className="w-3 h-3" />
                      +18% this week
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Checkout Flow v2', testers: 8, done: 8, sentiment: 92, color: 'bg-accent' },
                      { name: 'Onboarding Redesign', testers: 12, done: 9, sentiment: 78, color: 'bg-primary' },
                      { name: 'Mobile App Navigation', testers: 6, done: 3, sentiment: 65, color: 'bg-amber-400' },
                    ].map((test) => (
                      <div key={test.name} className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/30 hover:border-border/60 transition-colors">
                        <div className={`w-2 h-10 rounded-full ${test.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{test.name}</p>
                          <p className="text-xs text-muted-foreground">{test.done}/{test.testers} testers complete</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{test.sentiment}%</p>
                          <p className="text-[10px] text-muted-foreground">positive</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-secondary/30 border border-border/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold">Task Completion Rate</span>
                      <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">+12.5% vs last week</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[45, 58, 42, 68, 55, 72, 60, 80, 74, 88, 82, 95].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-all ${i === 11 ? 'bg-primary' : 'bg-primary/20'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-primary/8 border border-primary/15">
                    <p className="text-xs text-primary font-semibold mb-1.5">✦ AI Summary</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "Users consistently struggle with the payment form. <strong>73%</strong> mentioned unclear error messages on step 3."
                    </p>
                  </div>
                  {[
                    { label: 'Total Sessions', value: '1,284', icon: Users },
                    { label: 'Avg. Turnaround', value: '18h', icon: Zap },
                    { label: 'Satisfaction', value: '4.9/5', icon: Star },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3.5 rounded-xl bg-secondary/40 border border-border/30 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold leading-none">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3.5 rounded-xl bg-accent/8 border border-accent/15">
                    <p className="text-xs font-semibold text-accent mb-2">Latest Feedback</p>
                    {[
                      { user: 'Anna S.', text: 'Super easy to navigate!' },
                      { user: 'Mike R.', text: 'Step 3 was confusing for me.' },
                    ].map((fb) => (
                      <div key={fb.user} className="flex items-start gap-2 mb-1.5 last:mb-0">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-primary">{fb.user[0]}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{fb.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
