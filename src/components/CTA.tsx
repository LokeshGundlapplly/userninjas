import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CTA() {
  return (
    <section className="py-28">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="scale">
          <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/30 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-primary/40 blur-[100px]" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative z-10 p-14 md:p-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Start Free Today
              </div>
              
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight text-primary-foreground leading-tight">
                Start getting real user<br />insights today
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mx-auto mb-10">
                Join 500+ companies building products people love. Launch your first test in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-12 py-7 text-base font-semibold rounded-xl gap-2 shadow-xl">
                    Start Testing — It's Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-10 py-7 text-base font-semibold rounded-xl">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
              
              <p className="mt-6 text-xs text-primary-foreground/50 uppercase tracking-wider font-medium">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
