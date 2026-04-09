import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="scale">
          <div className="relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/80" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/40 blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/50 blur-[120px]" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }} />

            <div className="relative z-10 p-14 md:p-20 lg:p-28 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/15 backdrop-blur-sm border border-background/25 text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-8 hover:bg-background/20 transition-all">
                <Zap className="w-3.5 h-3.5" />
                Get Started Now
              </div>
              
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-primary-foreground leading-[1.1] drops">
                Transform Insights Into<br />
                <span className="text-background">Competitive Advantage</span>
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12 font-light">
                Stop guessing what your users want. Get real data, AI-driven insights, and actionable recommendations in hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/95 px-12 py-7 text-base font-semibold rounded-2xl gap-2 shadow-2xl shadow-black/30 transition-all">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/15 px-12 py-7 text-base font-semibold rounded-2xl backdrop-blur-sm transition-all">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center text-xs text-primary-foreground/60 uppercase tracking-wider font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary-foreground/40" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary-foreground/40" />
                  14-day full access
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary-foreground/40" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
