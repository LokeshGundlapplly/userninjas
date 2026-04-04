import { Video, MessageSquare, TrendingUp, Play, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Dashboard Preview</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Your research command center
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need in one beautiful, intuitive dashboard.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Video Recording Card */}
              <div className="rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/25">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10 mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center z-10">
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                    <span className="text-[10px] bg-foreground/80 text-background px-2 py-0.5 rounded">●  REC 12:34</span>
                    <span className="text-[10px] bg-primary/80 text-primary-foreground px-2 py-0.5 rounded">HD</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-primary" />
                  <h4 className="font-display font-semibold text-sm">Session Recordings</h4>
                </div>
                <p className="text-xs text-muted-foreground">Watch users navigate your product with screen and voice recording.</p>
              </div>

              {/* User Feedback Card */}
              <div className="rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/25">
                <div className="space-y-3 mb-4">
                  {[
                    { name: 'Anna S.', text: 'The checkout flow was confusing at step 3...', sentiment: 'Negative' },
                    { name: 'Mike R.', text: 'Love the new onboarding! Very intuitive.', sentiment: 'Positive' },
                    { name: 'Lisa K.', text: 'Navigation feels natural but search is slow.', sentiment: 'Mixed' },
                  ].map((fb) => (
                    <div key={fb.name} className="p-3 rounded-xl bg-secondary/60 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{fb.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          fb.sentiment === 'Positive' ? 'bg-success/10 text-success' :
                          fb.sentiment === 'Negative' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {fb.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{fb.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h4 className="font-display font-semibold text-sm">User Feedback</h4>
                </div>
                <p className="text-xs text-muted-foreground">Sentiment-tagged feedback from every test session.</p>
              </div>

              {/* AI Insights Card */}
              <div className="rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/25">
                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Summary</span>
                    </div>
                    <p className="text-[11px] text-foreground leading-relaxed">Users consistently struggle with the payment form validation. 73% mentioned unclear error messages.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Top Pain Points</p>
                    {['Payment form errors unclear', 'Search results load slowly', 'Mobile nav hard to find'].map((point) => (
                      <div key={point} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                        <span className="text-[11px] text-foreground">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="font-display font-semibold text-sm">AI Insights</h4>
                </div>
                <p className="text-xs text-muted-foreground">Automated pain point detection and smart analysis.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
