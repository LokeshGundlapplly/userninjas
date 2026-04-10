import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const quickStats = [
  { icon: Users, label: '500+ product teams' },
  { icon: Clock, label: 'Results in under 24h' },
  { icon: Sparkles, label: 'AI-powered analysis' },
  { icon: TrendingUp, label: '10× faster research cycles' },
];

export default function CTA() {
  return (
    <section className="py-28 bg-secondary/20">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="scale">
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden group">
            {/* Animated Aurora sweeps */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(var(--teal))]" />
            <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute w-[200%] h-[100%] top-0 -left-full shimmer-surface opacity-20" />
            </div>
            
            {/* Layered orbs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-[60px]" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/90 mb-8">
                  <Zap className="w-3.5 h-3.5" />
                  Join 500+ research-driven teams shipping faster
                </div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-5">
                  Ship products your users<br />actually love
                </h2>
                <p className="text-base md:text-lg text-white/70 max-w-lg mx-auto mb-8">
                  From prototype testing to post-launch insights — run your first study in minutes and get results before your next sprint ends.
                </p>

                {/* Testimonial quote */}
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 mb-8 text-left">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/80 italic leading-relaxed mb-2">
                    "We ran 12 usability tests in two days and completely re-designed our onboarding. Conversion went up 34% the following week. User Ninjas is a game-changer."
                  </p>
                  <p className="text-xs text-white/50 font-medium">— Priya S., Head of Product at Growfast</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/95 px-10 h-12 text-base font-semibold rounded-xl gap-2 shadow-2xl w-full sm:w-auto">
                      Start Free Trial — No Credit Card
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-10 h-12 text-base font-semibold rounded-xl w-full sm:w-auto">
                      Book a Demo
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                  {quickStats.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-white/70 text-sm">
                      <s.icon className="w-4 h-4 shrink-0" />
                      {s.label}
                    </div>
                  ))}
                </div>
                
                <p className="mt-7 text-xs text-white/40 uppercase tracking-wider font-medium">
                  14-day free trial · Cancel anytime · SOC 2 & GDPR compliant
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
