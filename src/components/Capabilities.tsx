import { Sparkles, Play, MessageSquare, TrendingUp, ArrowRight, Mic, Eye, CheckCircle2, BarChart2, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

const sessionHighlights = [
  { icon: Eye, text: 'Watch every click, pause, and frustration in real time' },
  { icon: Mic, text: 'Auto-transcribed audio with speaker identification' },
  { icon: Sparkles, text: 'AI highlights the most critical moments automatically' },
];

const platformStats = [
  { icon: BarChart2, value: '94%', label: 'Avg. task completion tracking accuracy' },
  { icon: Users2, value: '120K+', label: 'Vetted testers across 50+ countries' },
  { icon: TrendingUp, value: '4.9★', label: 'Average platform rating on G2' },
];

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-28 bg-secondary/20">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Platform</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Your research{' '}
              <span className="text-gradient">command center</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need to understand your users — from recording to AI-powered insights — in one intuitive dashboard.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Row 1: Video + AI Side by Side */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Session recording card — wider */}
            <ScrollReveal animation="fade-up" delay={100} className="lg:col-span-3">
              <div className="rounded-2xl bg-card border border-border/50 p-6 h-full hover:border-primary/25 hover:shadow-xl transition-all duration-300">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border/30 mb-5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      REC
                    </span>
                    <span className="text-[10px] bg-foreground/70 text-background px-2.5 py-1 rounded-full font-medium">04:23</span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center z-10 hover:bg-primary/25 transition-colors cursor-pointer">
                    <Play className="w-7 h-7 text-primary ml-1" />
                  </div>
                  {/* Timeline with emotion markers */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="h-1.5 bg-foreground/20 rounded-full overflow-hidden relative">
                      <div className="h-full bg-primary rounded-full" style={{ width: '35%' }} />
                      <div className="absolute top-0 h-full flex items-center gap-0" style={{ left: '22%' }}>
                        <div className="w-2 h-2 rounded-full bg-destructive border border-background -mt-0.5" title="Frustration detected" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] text-foreground/40">1:32</span>
                      <span className="text-[9px] text-destructive/60 font-medium">😤 Frustration at 0:54</span>
                      <span className="text-[9px] text-foreground/40">4:23</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg mb-2">Session Recordings</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Watch users navigate your product with HD screen, voice, and facial expression recording. See exactly where they struggle — emotion detection included.
                </p>

                <div className="space-y-2">
                  {sessionHighlights.map((h) => (
                    <div key={h.text} className="flex items-start gap-2.5">
                      <h.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{h.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* AI insights — narrower */}
            <ScrollReveal animation="fade-up" delay={200} className="lg:col-span-2 flex flex-col gap-5">
              <div className="rounded-2xl bg-card border border-border/50 p-6 flex-1 hover:border-accent/25 hover:shadow-xl transition-all duration-300">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/8 to-accent/5 border border-primary/15 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">AI Summary</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    "Users consistently struggle with payment validation. <strong>73%</strong> mentioned unclear error messages on step 3."
                  </p>
                </div>
                <h3 className="font-display font-bold mb-1.5">AI-Powered Insights</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatic pain point detection, sentiment analysis, and prioritized recommendations after every session.
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border/50 p-6 flex-1 hover:border-accent/25 hover:shadow-xl transition-all duration-300">
                <div className="space-y-2 mb-4">
                  {[
                    { name: 'Anna S.', text: '"Step 3 checkout was super confusing"', tag: 'Negative', tagColor: 'bg-destructive/10 text-destructive' },
                    { name: 'Mike R.', text: '"New onboarding is really intuitive!"', tag: 'Positive', tagColor: 'bg-accent/10 text-accent' },
                    { name: 'Jess L.', text: '"Wish I could see my progress earlier"', tag: 'Suggestion', tagColor: 'bg-primary/10 text-primary' },
                  ].map((fb) => (
                    <div key={fb.name} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border/20">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-primary">{fb.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground truncate">{fb.text}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${fb.tagColor}`}>{fb.tag}</span>
                    </div>
                  ))}
                </div>
                <h3 className="font-display font-bold mb-1">Tagged Feedback</h3>
                <p className="text-xs text-muted-foreground">Every piece of feedback is sentiment-tagged and ready to export.</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Row 2: Platform stats */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="grid sm:grid-cols-3 gap-4">
              {platformStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5 flex items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground leading-snug mt-0.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade-up" delay={450}>
          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base font-semibold rounded-xl gap-2 shadow-xl shadow-primary/20">
                Explore the Platform Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
