import { Video, MessageSquare, TrendingUp, Play, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-32 bg-secondary/40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-5 hover:bg-primary/15 transition-all">
              <Zap className="w-3 h-3" />
              Live Dashboard
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
              The unified command <span className="text-gradient">center for insights</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visualize user behavior, AI-powered recommendations, and actionable insights all in one intuitive interface.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-7xl mx-auto">
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Large card - Video */}
              <div className="rounded-3xl bg-card border border-border/50 p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30 group">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 mb-6 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/5" />
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-pointer group-hover:bg-primary/30">
                    <Play className="w-7 h-7 text-primary ml-1" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                    <span className="text-[11px] bg-foreground/80 text-background px-3 py-1 rounded-lg font-semibold">● REC 14:32</span>
                    <span className="text-[11px] bg-primary/80 text-primary-foreground px-3 py-1 rounded-lg font-semibold">4K Ultra</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <Video className="w-5 h-5 text-primary" />
                  <h4 className="font-display font-bold text-lg">High-Fidelity Recordings</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">Capture crystal-clear HD/4K session recordings with synchronized audio and system sound. Watch every interaction frame-by-frame.</p>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* AI Insights */}
                <div className="rounded-3xl bg-card border border-border/50 p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/8 border border-primary/15 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Intelligence Engine</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-medium">Critical: 73% fail at payment validation. Sentiment Score: 2.1/5 ⚠️</p>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-bold">Intelligent Pattern Detection</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Automatic transcription, sentiment tracking, friction identification, and behavior correlation.</p>
                </div>

                {/* Feedback */}
                <div className="rounded-3xl bg-card border border-border/50 p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30">
                  <div className="space-y-2.5 mb-5">
                    {[
                      { name: 'Sarah M.', text: '💡 Confusing error message prevented purchase', sentiment: 'Critical' },
                      { name: 'James L.', text: '✨ Loved the new onboarding flow!', sentiment: 'Positive' },
                    ].map((fb) => (
                      <div key={fb.name} className="p-3 rounded-xl bg-secondary/60 border border-border/30 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{fb.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold">{fb.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              fb.sentiment === 'Positive' ? 'bg-success/15 text-success' : fb.sentiment === 'Critical' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'
                            }`}>{fb.sentiment}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{fb.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <h4 className="font-display font-bold">Sentiment-Tagged Insights</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Every comment categorized by emotion, priority, and theme for rapid action.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="text-center mt-16">
              <Link to="/auth">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/25 hover:shadow-xl">
                  Explore the Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
