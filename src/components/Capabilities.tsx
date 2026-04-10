import { Sparkles, Play, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Platform</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Your research <span className="text-gradient">command center</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need in one intuitive dashboard.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Video card — full height left */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="rounded-2xl bg-card border border-border/50 p-6 h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="aspect-video rounded-xl bg-secondary/60 border border-border/30 mb-5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center z-10">
                  <Play className="w-6 h-6 text-primary ml-0.5" />
                </div>
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="text-[10px] bg-foreground/80 text-background px-2.5 py-1 rounded-md font-medium">● REC 12:34</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-lg mb-1.5">Session Recordings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Watch users navigate your product with screen, voice, and face recording. See exactly where they struggle.
              </p>
            </div>
          </ScrollReveal>

          {/* Right column stacked */}
          <div className="space-y-6">
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">AI Summary</span>
                  </div>
                  <p className="text-sm leading-relaxed">Users consistently struggle with payment form validation. 73% mentioned unclear error messages.</p>
                </div>
                <h3 className="font-display font-bold mb-1">AI-Powered Insights</h3>
                <p className="text-xs text-muted-foreground">Automatic pain point detection, sentiment analysis, and smart recommendations.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-2 mb-4">
                  {[
                    { name: 'Anna S.', text: 'Checkout was confusing at step 3', tag: 'Negative' },
                    { name: 'Mike R.', text: 'New onboarding is very intuitive!', tag: 'Positive' },
                  ].map((fb) => (
                    <div key={fb.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 border border-border/20">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{fb.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{fb.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{fb.text}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        fb.tag === 'Positive' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                      }`}>{fb.tag}</span>
                    </div>
                  ))}
                </div>
                <h3 className="font-display font-bold mb-1">Tagged Feedback</h3>
                <p className="text-xs text-muted-foreground">Sentiment-tagged feedback from every session, ready to export.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal animation="fade-up" delay={400}>
          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20">
                Try the Dashboard Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
